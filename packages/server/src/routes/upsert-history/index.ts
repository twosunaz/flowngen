import upsertHistoryController from '../../controllers/upsert-history'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE

// READ
router.get(['/', '/:id'], upsertHistoryController.getAllUpsertHistory)

// PATCH
router.patch('/', upsertHistoryController.patchDeleteUpsertHistory)

// DELETE

export default router
