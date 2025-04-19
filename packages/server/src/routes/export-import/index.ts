import exportImportController from '../../controllers/export-import'
import { Router } from 'express'
const router: Router = require('express').Router()

router.post('/export', exportImportController.exportData)

router.post('/import', exportImportController.importData)

export default router
