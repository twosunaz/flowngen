import pingController from '../../controllers/ping'
import { Router } from 'express'
const router: Router = require('express').Router()

// GET
router.get('/', pingController.getPing)

export default router
