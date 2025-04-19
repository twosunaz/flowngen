import openaiRealTimeController from '../../controllers/openai-realtime'

import { Router } from 'express'
const router: Router = require('express').Router()

// GET
router.get(['/', '/:id'], openaiRealTimeController.getAgentTools)

// EXECUTE
router.post(['/', '/:id'], openaiRealTimeController.executeAgentTool)

export default router
