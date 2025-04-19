import statsController from '../../controllers/stats'
import { Router } from 'express'
const router: Router = require('express').Router()

// READ
router.get(['/', '/:id'], statsController.getChatflowStats)

export default router
