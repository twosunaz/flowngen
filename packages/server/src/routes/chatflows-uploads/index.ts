import chatflowsController from '../../controllers/chatflows'
import { Router } from 'express'
const router: Router = require('express').Router()

// READ
router.get(['/', '/:id'], chatflowsController.checkIfChatflowIsValidForUploads)

export default router
