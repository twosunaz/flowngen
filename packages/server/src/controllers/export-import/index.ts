import { NextFunction, Request, Response } from 'express'
import exportImportService from '../../services/export-import'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'

const exportData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User ID not found in request')
        }

        const exportInput = exportImportService.convertExportInput(req.body)
        const apiResponse = await exportImportService.exportData(exportInput, userId)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const importData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id
        if (!userId) {
            throw new InternalFlowiseError(StatusCodes.UNAUTHORIZED, 'User ID not found in request')
        }

        const importData = req.body
        await exportImportService.importData(importData, userId)
        return res.json({ message: 'success' })
    } catch (error) {
        next(error)
    }
}

export default {
    exportData,
    importData
}
