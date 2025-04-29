import { Request, Response, NextFunction } from 'express'
import credentialsService from '../../services/credentials'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'

const createCredential = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: credentialsController.createCredential - body not provided!`
            )
        }

        // 🧠 Extract userId
        const user = req.user as { id: string } | undefined
        if (!user || !user.id) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const userId = user.id

        const apiResponse = await credentialsService.createCredential(req.body, userId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const deleteCredentials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: credentialsController.deleteCredentials - id not provided!`
            )
        }

        // 🧠 Extract userId
        const user = req.user as { id: string } | undefined
        if (!user || !user.id) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const userId = user.id

        const apiResponse = await credentialsService.deleteCredentials(req.params.id, userId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getAllCredentials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 🧠 Extract userId
        const user = req.user as { id: string } | undefined
        if (!user || !user.id) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const userId = user.id

        const apiResponse = await credentialsService.getAllCredentials(req.query.credentialName, userId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getCredentialById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: credentialsController.getCredentialById - id not provided!`
            )
        }

        // 🧠 Extract userId
        const user = req.user as { id: string } | undefined
        if (!user || !user.id) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const userId = user.id

        const apiResponse = await credentialsService.getCredentialById(req.params.id, userId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const updateCredential = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: credentialsController.updateCredential - id not provided!`
            )
        }
        if (!req.body) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: credentialsController.updateCredential - body not provided!`
            )
        }

        // 🧠 Extract userId
        const user = req.user as { id: string } | undefined
        if (!user || !user.id) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const userId = user.id

        const apiResponse = await credentialsService.updateCredential(req.params.id, req.body, userId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

export default {
    createCredential,
    deleteCredentials,
    getAllCredentials,
    getCredentialById,
    updateCredential
}
