import { removeFolderFromStorage } from 'flowise-components'
import { StatusCodes } from 'http-status-codes'
import { ChatflowType, IReactFlowObject } from '../../Interface'
import { ChatFlow } from '../../database/entities/ChatFlow'
import { ChatMessage } from '../../database/entities/ChatMessage'
import { ChatMessageFeedback } from '../../database/entities/ChatMessageFeedback'
import { UpsertHistory } from '../../database/entities/UpsertHistory'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'
import documentStoreService from '../../services/documentstore'
import { constructGraphs, getAppVersion, getEndingNodes, getTelemetryFlowObj, isFlowValidForStream } from '../../utils'
import { containsBase64File, updateFlowDataWithFilePaths } from '../../utils/fileRepository'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { utilGetUploadsConfig } from '../../utils/getUploadsConfig'
import logger from '../../utils/logger'
import { FLOWISE_METRIC_COUNTERS, FLOWISE_COUNTER_STATUS } from '../../Interface.Metrics'
import { QueryRunner } from 'typeorm'

const checkIfChatflowIsValidForStreaming = async (chatflowId: string, userId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const chatflow = await appServer.AppDataSource.getRepository(ChatFlow).findOneBy({ id: chatflowId, userId })
        if (!chatflow) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Chatflow ${chatflowId} not found`)
        }
        const parsedFlowData: IReactFlowObject = JSON.parse(chatflow.flowData)
        const { graph, nodeDependencies } = constructGraphs(parsedFlowData.nodes, parsedFlowData.edges)
        const endingNodes = getEndingNodes(nodeDependencies, graph, parsedFlowData.nodes)
        let isStreaming = false
        for (const node of endingNodes) {
            const data = node.data
            if (data?.outputs?.output === 'EndingNode') return { isStreaming: false }
            isStreaming = isFlowValidForStream(parsedFlowData.nodes, data)
        }
        if (endingNodes.some((n) => ['Multi Agents', 'Sequential Agents'].includes(n.data.category))) {
            return { isStreaming: true }
        }
        return { isStreaming }
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: chatflowsService.checkIfChatflowIsValidForStreaming - ${getErrorMessage(error)}`
        )
    }
}

const checkIfChatflowIsValidForUploads = async (chatflowId: string): Promise<any> => {
    try {
        return await utilGetUploadsConfig(chatflowId)
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: chatflowsService.checkIfChatflowIsValidForUploads - ${getErrorMessage(error)}`
        )
    }
}

const deleteChatflow = async (chatflowId: string, userId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const chatflow = await appServer.AppDataSource.getRepository(ChatFlow).findOneBy({ id: chatflowId, userId })
        if (!chatflow) throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Chatflow ${chatflowId} not found`)
        const dbResponse = await appServer.AppDataSource.getRepository(ChatFlow).delete({ id: chatflowId, userId })
        try {
            await removeFolderFromStorage(chatflowId)
            await documentStoreService.updateDocumentStoreUsage(chatflowId, undefined)
            await appServer.AppDataSource.getRepository(ChatMessage).delete({ chatflowid: chatflowId })
            await appServer.AppDataSource.getRepository(ChatMessageFeedback).delete({ chatflowid: chatflowId })
            await appServer.AppDataSource.getRepository(UpsertHistory).delete({ chatflowid: chatflowId })
        } catch (e) {
            logger.error(`[server]: Error deleting file storage for chatflow ${chatflowId}: ${e}`)
        }
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: chatflowsService.deleteChatflow - ${getErrorMessage(error)}`
        )
    }
}

const getAllChatflows = async (type?: ChatflowType, userId?: string): Promise<ChatFlow[]> => {
    try {
        const appServer = getRunningExpressApp()
        let query = appServer.AppDataSource.getRepository(ChatFlow).createQueryBuilder('chatflow')
        if (userId) query = query.where('chatflow.userId = :userId', { userId })
        const dbResponse = await query.getMany()
        if (type === 'MULTIAGENT') return dbResponse.filter((f) => f.type === 'MULTIAGENT')
        if (type === 'CHATFLOW') return dbResponse.filter((f) => f.type === 'CHATFLOW' || !f.type)
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: chatflowsService.getAllChatflows - ${getErrorMessage(error)}`
        )
    }
}

const getChatflowByApiKey = async (apiKeyId: string, keyonly?: unknown): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        let query = appServer.AppDataSource.getRepository(ChatFlow)
            .createQueryBuilder('cf')
            .where('cf.apikeyid = :apikeyid', { apikeyid: apiKeyId })
        if (keyonly === undefined) {
            query = query.orWhere('cf.apikeyid IS NULL').orWhere('cf.apikeyid = ""')
        }
        const dbResponse = await query.orderBy('cf.name', 'ASC').getMany()
        if (!dbResponse.length) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Chatflow not found in the database!`)
        }
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: chatflowsService.getChatflowByApiKey - ${getErrorMessage(error)}`
        )
    }
}

const getChatflowById = async (chatflowId: string, userId?: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(ChatFlow).findOneBy(
            userId ? { id: chatflowId, userId } : { id: chatflowId }
        )
        if (!dbResponse) {
            throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Chatflow ${chatflowId} not found in the database!`)
        }
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: chatflowsService.getChatflowById - ${getErrorMessage(error)}`
        )
    }
}

const saveChatflow = async (newChatFlow: ChatFlow, userId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        let dbResponse: ChatFlow
        newChatFlow.userId = userId
        if (containsBase64File(newChatFlow)) {
            const incomingFlowData = newChatFlow.flowData
            newChatFlow.flowData = JSON.stringify({})
            const chatflow = appServer.AppDataSource.getRepository(ChatFlow).create(newChatFlow)
            const step1Results = await appServer.AppDataSource.getRepository(ChatFlow).save(chatflow)
            step1Results.flowData = await updateFlowDataWithFilePaths(step1Results.id, incomingFlowData)
            await _checkAndUpdateDocumentStoreUsage(step1Results)
            dbResponse = await appServer.AppDataSource.getRepository(ChatFlow).save(step1Results)
        } else {
            const chatflow = appServer.AppDataSource.getRepository(ChatFlow).create(newChatFlow)
            dbResponse = await appServer.AppDataSource.getRepository(ChatFlow).save(chatflow)
        }
        await appServer.telemetry.sendTelemetry('chatflow_created', {
            version: await getAppVersion(),
            chatflowId: dbResponse.id,
            flowGraph: getTelemetryFlowObj(JSON.parse(dbResponse.flowData)?.nodes, JSON.parse(dbResponse.flowData)?.edges)
        })
        appServer.metricsProvider?.incrementCounter(
            dbResponse?.type === 'MULTIAGENT' ? FLOWISE_METRIC_COUNTERS.AGENTFLOW_CREATED : FLOWISE_METRIC_COUNTERS.CHATFLOW_CREATED,
            { status: FLOWISE_COUNTER_STATUS.SUCCESS }
        )
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: chatflowsService.saveChatflow - ${getErrorMessage(error)}`
        )
    }
}

const importChatflows = async (newChatflows: Partial<ChatFlow>[], userId: string, queryRunner?: QueryRunner): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const repository = queryRunner ? queryRunner.manager.getRepository(ChatFlow) : appServer.AppDataSource.getRepository(ChatFlow)
        if (!newChatflows.length) return
        const ids = `(${newChatflows.map((f) => `'${f.id}'`).join(',')})`
        const existing = await repository.createQueryBuilder('cf').select('cf.id').where(`cf.id IN ${ids}`).getMany()
        const existingIds = existing.map((e) => e.id)
        const prepChatflows = newChatflows.map((f) => {
            if (existingIds.includes(f.id!)) {
                f.id = undefined
                f.name = `${f.name} (1)`
            }
            f.userId = userId
            f.flowData = JSON.stringify(JSON.parse(f.flowData!))
            return f
        })
        return await repository.insert(prepChatflows)
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: chatflowsService.saveChatflows - ${getErrorMessage(error)}`
        )
    }
}

const updateChatflow = async (chatflow: ChatFlow, updateChatFlow: ChatFlow, userId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        if (chatflow.userId !== userId) throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
        if (updateChatFlow.flowData && containsBase64File(updateChatFlow)) {
            updateChatFlow.flowData = await updateFlowDataWithFilePaths(chatflow.id, updateChatFlow.flowData)
        }
        const newDbChatflow = appServer.AppDataSource.getRepository(ChatFlow).merge(chatflow, updateChatFlow)
        await _checkAndUpdateDocumentStoreUsage(newDbChatflow)
        return await appServer.AppDataSource.getRepository(ChatFlow).save(newDbChatflow)
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: chatflowsService.updateChatflow - ${getErrorMessage(error)}`
        )
    }
}

const getSinglePublicChatflow = async (chatflowId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(ChatFlow).findOneBy({ id: chatflowId })
        if (dbResponse?.isPublic) return dbResponse
        if (dbResponse && !dbResponse.isPublic) throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, `Unauthorized`)
        throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Chatflow ${chatflowId} not found`)
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: chatflowsService.getSinglePublicChatflow - ${getErrorMessage(error)}`
        )
    }
}

const getSinglePublicChatbotConfig = async (chatflowId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()
        const dbResponse = await appServer.AppDataSource.getRepository(ChatFlow).findOneBy({ id: chatflowId })
        if (!dbResponse) throw new InternalFlowiseError(StatusCodes.NOT_FOUND, `Chatflow ${chatflowId} not found`)
        const uploadsConfig = await utilGetUploadsConfig(chatflowId)
        if (dbResponse.chatbotConfig || uploadsConfig) {
            try {
                const parsedConfig = dbResponse.chatbotConfig ? JSON.parse(dbResponse.chatbotConfig) : {}
                return { ...parsedConfig, uploads: uploadsConfig }
            } catch (e) {
                throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error parsing Chatbot Config for Chatflow ${chatflowId}`)
            }
        }
        return 'OK'
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: chatflowsService.getSinglePublicChatbotConfig - ${getErrorMessage(error)}`
        )
    }
}

const _checkAndUpdateDocumentStoreUsage = async (chatflow: ChatFlow) => {
    const parsedFlowData: IReactFlowObject = JSON.parse(chatflow.flowData)
    const node = parsedFlowData.nodes?.find((n) => n.data?.name === 'documentStore')
    if (!node?.data?.inputs?.['selectedStore']) {
        await documentStoreService.updateDocumentStoreUsage(chatflow.id, undefined)
    } else {
        await documentStoreService.updateDocumentStoreUsage(chatflow.id, node.data.inputs['selectedStore'])
    }
}

export default {
    checkIfChatflowIsValidForStreaming,
    checkIfChatflowIsValidForUploads,
    deleteChatflow,
    getAllChatflows,
    getChatflowByApiKey,
    getChatflowById,
    saveChatflow,
    importChatflows,
    updateChatflow,
    getSinglePublicChatflow,
    getSinglePublicChatbotConfig
}
