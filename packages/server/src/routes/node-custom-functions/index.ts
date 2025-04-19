import nodesRouter from '../../controllers/nodes'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE

// READ
router.post('/', nodesRouter.executeCustomFunction)

// UPDATE

// DELETE

export default router
