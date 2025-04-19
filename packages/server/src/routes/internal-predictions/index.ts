import internalPredictionsController from '../../controllers/internal-predictions'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE
router.post(['/', '/:id'], internalPredictionsController.createInternalPrediction)

export default router
