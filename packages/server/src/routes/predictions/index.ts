import predictionsController from '../../controllers/predictions'
import { getMulterStorage } from '../../utils'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE
router.post(
    ['/', '/:id'],
    getMulterStorage().array('files'),
    predictionsController.getRateLimiterMiddleware,
    predictionsController.createPrediction
)

export default router
