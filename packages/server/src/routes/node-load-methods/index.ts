import nodesRouter from '../../controllers/nodes'
import { Router } from 'express'
const router: Router = require('express').Router()

router.post(['/', '/:name'], nodesRouter.getSingleNodeAsyncOptions)

export default router
