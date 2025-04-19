import openaiAssistantsController from '../../controllers/openai-assistants'
import { getMulterStorage } from '../../utils'
import { Router } from 'express'
const router: Router = require('express').Router()

router.post('/download/', openaiAssistantsController.getFileFromAssistant)
router.post('/upload/', getMulterStorage().array('files'), openaiAssistantsController.uploadAssistantFiles)

export default router
