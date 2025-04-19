import chatflowsController from '../../controllers/chatflows'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE

// READ
router.get(['/', '/:id'], chatflowsController.getSinglePublicChatbotConfig)

// UPDATE

// DELETE

export default router
