import { Request, Response, NextFunction } from 'express'
import attachmentsService from '../../services/attachments'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'

const createAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as { id: string } | undefined
        if (!user || !user.id) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const userId = user.id

        const apiResponse = await attachmentsService.createAttachment(req, userId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

export default {
    createAttachment
}
