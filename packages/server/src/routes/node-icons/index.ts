import nodesController from '../../controllers/nodes'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE

// READ
router.get(['/', '/:name'], nodesController.getSingleNodeIcon)

// UPDATE

// DELETE

export default router
