import vectorsController from '../../controllers/vectors'
import { getMulterStorage } from '../../utils'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE
router.post(
    ['/upsert/', '/upsert/:id'],
    getMulterStorage().array('files'),
    vectorsController.getRateLimiterMiddleware,
    vectorsController.upsertVectorMiddleware
)
router.post(['/internal-upsert/', '/internal-upsert/:id'], getMulterStorage().array('files'), vectorsController.createInternalUpsert)

export default router
