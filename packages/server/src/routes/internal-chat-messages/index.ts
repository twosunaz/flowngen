import chatMessagesController from '../../controllers/chat-messages'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE

// READ
router.get(['/', '/:id'], chatMessagesController.getAllInternalChatMessages)

// UPDATE

// DELETE

export default router
