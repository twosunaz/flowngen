import { MoreThanOrEqual, LessThanOrEqual, Between, In } from 'typeorm'
import { StatusCodes } from 'http-status-codes'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { UpsertHistory } from '../../database/entities/UpsertHistory'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { getErrorMessage } from '../../errors/utils'

const getAllUpsertHistory = async (
    sortOrder: string | undefined,
    chatflowid: string | undefined,
    startDate: string | undefined,
    endDate: string | undefined,
    userId: string
) => {
    try {
        const appServer = getRunningExpressApp()

        let createdDateQuery
        if (startDate || endDate) {
            if (startDate && endDate) {
                createdDateQuery = Between(new Date(startDate), new Date(endDate))
            } else if (startDate) {
                createdDateQuery = MoreThanOrEqual(new Date(startDate))
            } else if (endDate) {
                createdDateQuery = LessThanOrEqual(new Date(endDate))
            }
        }
        let upsertHistory = await appServer.AppDataSource.getRepository(UpsertHistory).find({
            where: {
                chatflowid,
                userId, // 🔥 Only return records belonging to the user
                date: createdDateQuery
            },
            order: {
                date: sortOrder === 'DESC' ? 'DESC' : 'ASC'
            }
        })

        upsertHistory = upsertHistory.map((hist) => ({
            ...hist,
            result: hist.result ? JSON.parse(hist.result) : {},
            flowData: hist.flowData ? JSON.parse(hist.flowData) : {}
        }))

        return upsertHistory
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: upsertHistoryServices.getAllUpsertHistory - ${getErrorMessage(error)}`
        )
    }
}

const patchDeleteUpsertHistory = async (ids: string[] = [], userId: string): Promise<any> => {
    try {
        const appServer = getRunningExpressApp()

        const dbResponse = await appServer.AppDataSource.getRepository(UpsertHistory).delete({
            id: In(ids),
            userId // 🔥 Only delete entries that belong to this user
        })
        return dbResponse
    } catch (error) {
        throw new InternalFlowiseError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Error: upsertHistoryServices.patchDeleteUpsertHistory - ${getErrorMessage(error)}`
        )
    }
}

export default {
    getAllUpsertHistory,
    patchDeleteUpsertHistory
}
