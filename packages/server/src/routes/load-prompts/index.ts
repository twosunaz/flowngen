import loadPromptsController from '../../controllers/load-prompts'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE
router.post('/', loadPromptsController.createPrompt)

export default router
