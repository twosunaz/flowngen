import openaiAssistantsController from '../../controllers/openai-assistants'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE

// READ
router.get('/', openaiAssistantsController.getAllOpenaiAssistants)
router.get(['/', '/:id'], openaiAssistantsController.getSingleOpenaiAssistant)

// UPDATE

// DELETE

export default router
