import { Request, Response, NextFunction } from 'express'
import * as fs from 'fs'
import openaiAssistantsService from '../../services/openai-assistants'
import contentDisposition from 'content-disposition'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'
import { streamStorageFile } from 'flowise-components'

// List available assistants
const getAllOpenaiAssistants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.query?.credential) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: openaiAssistantsController.getAllOpenaiAssistants - credential not provided!`
            )
        }
        if (!req.user?.id) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, `User ID not found in request!`)
        }

        const credentialId = req.query.credential as string
        const userId = req.user.id

        const apiResponse = await openaiAssistantsService.getAllOpenaiAssistants(credentialId, userId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

// Get assistant object
const getSingleOpenaiAssistant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: openaiAssistantsController.getSingleOpenaiAssistant - id not provided!`
            )
        }
        if (typeof req.query === 'undefined' || !req.query.credential) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: openaiAssistantsController.getSingleOpenaiAssistant - credential not provided!`
            )
        }

        if (!req.user?.id) {
            throw new InternalFlowiseError(
                StatusCodes.UNAUTHORIZED,
                `Error: openaiAssistantsController.getSingleOpenaiAssistant - User ID not found!`
            )
        }

        const apiResponse = await openaiAssistantsService.getSingleOpenaiAssistant(
            req.query.credential as string,
            req.params.id,
            req.user.id // 🧠 pass userId here
        )
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

// Download file from assistant
const getFileFromAssistant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.chatflowId || !req.body.chatId || !req.body.fileName) {
            return res.status(500).send(`Invalid file path`)
        }
        const chatflowId = req.body.chatflowId as string
        const chatId = req.body.chatId as string
        const fileName = req.body.fileName as string
        res.setHeader('Content-Disposition', contentDisposition(fileName))
        const fileStream = await streamStorageFile(chatflowId, chatId, fileName)

        if (!fileStream) throw new InternalFlowiseError(StatusCodes.INTERNAL_SERVER_ERROR, `Error: getFileFromAssistant`)

        if (fileStream instanceof fs.ReadStream && fileStream?.pipe) {
            fileStream.pipe(res)
        } else {
            res.send(fileStream)
        }
    } catch (error) {
        next(error)
    }
}

const uploadAssistantFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.query === 'undefined' || !req.query.credential) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: openaiAssistantsVectorStoreController.uploadFilesToAssistantVectorStore - credential not provided!`
            )
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

        const apiResponse = await openaiAssistantsService.uploadFilesToAssistant(req.query.credential as string, uploadFiles, userId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

export default {
    getAllOpenaiAssistants,
    getSingleOpenaiAssistant,
    getFileFromAssistant,
    uploadAssistantFiles
}
