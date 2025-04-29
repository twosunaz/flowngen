import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import apiKeyService from '../../services/apikey'
import { ChatFlow } from '../../database/entities/ChatFlow'
import { RateLimiterManager } from '../../utils/rateLimit'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { ChatflowType } from '../../Interface'
import chatflowsService from '../../services/chatflows'

const checkIfChatflowIsValidForStreaming = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id || !req.user?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Chatflow ID or user ID not provided')
        }
        const apiResponse = await chatflowsService.checkIfChatflowIsValidForStreaming(req.params.id, req.user.id)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const checkIfChatflowIsValidForUploads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Chatflow ID not provided')
        }

        // 🧠 Extract userId
        if (!req.user || !req.user.id) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const userId = req.user.id

        const apiResponse = await chatflowsService.checkIfChatflowIsValidForUploads(req.params.id, userId)

        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const deleteChatflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id || !req.user?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Chatflow ID or user ID not provided')
        }
        const apiResponse = await chatflowsService.deleteChatflow(req.params.id, req.user.id)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getAllChatflows = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user?.id) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User ID not found in request')
        }
        const apiResponse = await chatflowsService.getAllChatflows(req.query?.type as ChatflowType, req.user.id)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getChatflowByApiKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.apikey) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'API key not provided')
        }
        const apikey = await apiKeyService.getApiKey(req.params.apikey)
        if (!apikey) return res.status(401).send('Unauthorized')
        const apiResponse = await chatflowsService.getChatflowByApiKey(apikey.id, req.query.keyonly)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getChatflowById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id || !req.user?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Chatflow ID or user ID not provided')
        }
        const apiResponse = await chatflowsService.getChatflowById(req.params.id, req.user.id)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const saveChatflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body || !req.user?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Request body or user ID not provided')
        }
        const body = req.body
        const newChatFlow = new ChatFlow()
        Object.assign(newChatFlow, body)
        newChatFlow.userId = req.user.id
        const apiResponse = await chatflowsService.saveChatflow(newChatFlow, req.user.id)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const importChatflows = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user?.id) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User ID not found in request')
        }
        const chatflows: Partial<ChatFlow>[] = req.body.Chatflows
        const apiResponse = await chatflowsService.importChatflows(chatflows, req.user.id, undefined)

        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const updateChatflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id || !req.user?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Chatflow ID or user ID not provided')
        }
        const chatflow = await chatflowsService.getChatflowById(req.params.id, req.user.id)
        if (!chatflow) return res.status(404).send(`Chatflow ${req.params.id} not found`)

        const body = req.body
        const updateChatFlow = new ChatFlow()
        Object.assign(updateChatFlow, body)
        updateChatFlow.id = chatflow.id
        updateChatFlow.userId = req.user.id

        const rateLimiterManager = RateLimiterManager.getInstance()
        await rateLimiterManager.updateRateLimiter(updateChatFlow)

        const apiResponse = await chatflowsService.updateChatflow(chatflow, updateChatFlow, req.user.id)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getSinglePublicChatflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Chatflow ID not provided')
        }
        const apiResponse = await chatflowsService.getSinglePublicChatflow(req.params.id)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getSinglePublicChatbotConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'Chatflow ID not provided')
        }

        // 🧠 Extract userId
        if (!req.user || !req.user.id) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const userId = req.user.id

        const apiResponse = await chatflowsService.getSinglePublicChatbotConfig(req.params.id, userId)

        return res.json(apiResponse)
    } catch (error) {
        next(error)
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
