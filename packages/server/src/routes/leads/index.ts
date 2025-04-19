import leadsController from '../../controllers/leads'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE
router.post('/', leadsController.createLeadInChatflow)

// READ
router.get(['/', '/:id'], leadsController.getAllLeadsForChatflow)

export default router
