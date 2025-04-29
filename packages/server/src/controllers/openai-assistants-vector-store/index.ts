import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import openAIAssistantVectorStoreService from '../../services/openai-assistants-vector-store'

const getAssistantVectorStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'id not provided!')
        }
        if (!req.query?.credential) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'credential not provided!')
        }
        const userId = req.user?.id
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const apiResponse = await openAIAssistantVectorStoreService.getAssistantVectorStore(
            req.query.credential as string,
            req.params.id,
            userId
        )
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const listAssistantVectorStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.query?.credential) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'credential not provided!')
        }
        const userId = req.user?.id
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const apiResponse = await openAIAssistantVectorStoreService.listAssistantVectorStore(req.query.credential as string, userId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const createAssistantVectorStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'body not provided!')
        }
        if (!req.query?.credential) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'credential not provided!')
        }
        const userId = req.user?.id
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const apiResponse = await openAIAssistantVectorStoreService.createAssistantVectorStore(
            req.query.credential as string,
            req.body,
            userId
        )
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const updateAssistantVectorStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'id not provided!')
        }
        if (!req.query?.credential) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'credential not provided!')
        }
        if (!req.body) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'body not provided!')
        }
        const userId = req.user?.id
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const apiResponse = await openAIAssistantVectorStoreService.updateAssistantVectorStore(
            req.query.credential as string,
            req.params.id,
            req.body,
            userId
        )
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const deleteAssistantVectorStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'id not provided!')
        }
        if (!req.query?.credential) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'credential not provided!')
        }
        const userId = req.user?.id
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }
        const apiResponse = await openAIAssistantVectorStoreService.deleteAssistantVectorStore(
            req.query.credential as string,
            req.params.id,
            userId
        )
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const uploadFilesToAssistantVectorStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'body not provided!')
        }
        if (!req.params?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'id not provided!')
        }
        if (!req.query?.credential) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'credential not provided!')
        }
        const userId = req.user?.id
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }

        const files = req.files ?? []
        const uploadFiles: { filePath: string; fileName: string }[] = []

        if (Array.isArray(files)) {
            for (const file of files) {
                file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
                uploadFiles.push({
                    filePath: file.path ?? file.key,
                    fileName: file.originalname
                })
            }
        }

        const apiResponse = await openAIAssistantVectorStoreService.uploadFilesToAssistantVectorStore(
            req.query.credential as string,
            req.params.id,
            uploadFiles,
            userId
        )
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const deleteFilesFromAssistantVectorStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'body not provided!')
        }
        if (!req.params?.id) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'id not provided!')
        }
        if (!req.query?.credential) {
            throw new InternalFlowiseError(StatusCodes.PRECONDITION_FAILED, 'credential not provided!')
        }
        const userId = req.user?.id
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User not authenticated')
        }

        const apiResponse = await openAIAssistantVectorStoreService.deleteFilesFromAssistantVectorStore(
            req.query.credential as string,
            req.params.id,
            req.body.file_ids,
            userId
        )
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

export default {
    getAssistantVectorStore,
    listAssistantVectorStore,
    createAssistantVectorStore,
    updateAssistantVectorStore,
    deleteAssistantVectorStore,
    uploadFilesToAssistantVectorStore,
    deleteFilesFromAssistantVectorStore
}
