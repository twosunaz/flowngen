import feedbackController from '../../controllers/feedback'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE
router.post(['/', '/:id'], feedbackController.createChatMessageFeedbackForChatflow)

// READ
router.get(['/', '/:id'], feedbackController.getAllChatMessageFeedback)

// UPDATE
router.put(['/', '/:id'], feedbackController.updateChatMessageFeedbackForChatflow)

export default router
