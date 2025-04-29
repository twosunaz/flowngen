import { Request, Response, NextFunction } from 'express'
import upsertHistoryService from '../../services/upsert-history'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'

const getAllUpsertHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }

        const sortOrder = req.query?.order as string | undefined
        const chatflowid = req.params?.id as string | undefined
        const startDate = req.query?.startDate as string | undefined
        const endDate = req.query?.endDate as string | undefined
        const apiResponse = await upsertHistoryService.getAllUpsertHistory(sortOrder, chatflowid, startDate, endDate, userId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const patchDeleteUpsertHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }

        const ids = req.body.ids ?? []
        const apiResponse = await upsertHistoryService.patchDeleteUpsertHistory(ids, userId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

export default {
    getAllUpsertHistory,
    patchDeleteUpsertHistory
}
