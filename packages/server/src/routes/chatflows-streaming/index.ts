import chatflowsController from '../../controllers/chatflows'
import { Router } from 'express'
const router: Router = require('express').Router()

// READ
router.get(['/', '/:id'], chatflowsController.checkIfChatflowIsValidForStreaming)

export default router
