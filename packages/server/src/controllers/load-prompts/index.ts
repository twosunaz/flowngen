import { Request, Response, NextFunction } from 'express'
import loadPromptsService from '../../services/load-prompts'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'

const createPrompt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.body === 'undefined' || !req.body.promptName) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: loadPromptsController.createPrompt - promptName not provided!`
            )
        }

        if (!req.user?.id) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, `Error: loadPromptsController.createPrompt - user not authenticated!`)
        }

        const apiResponse = await loadPromptsService.createPrompt(req.body.promptName as string, req.user.id)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

export default {
    createPrompt
}
