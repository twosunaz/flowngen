import nodesController from '../../controllers/nodes'
import { Router } from 'express'
const router: Router = require('express').Router()

// READ
router.get('/', nodesController.getAllNodes)
router.get(['/', '/:name'], nodesController.getNodeByName)
router.get('/category/:name', nodesController.getNodesByCategory)

export default router
