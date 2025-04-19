import flowConfigsController from '../../controllers/flow-configs'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE

// READ
router.get(['/', '/:id'], flowConfigsController.getSingleFlowConfig)

// UPDATE

// DELETE

export default router
