import nodeConfigsController from '../../controllers/node-configs'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE
router.post('/', nodeConfigsController.getAllNodeConfigs)

export default router
