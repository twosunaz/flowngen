import promptsListController from '../../controllers/prompts-lists'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE
router.post('/', promptsListController.createPromptsList)

export default router
