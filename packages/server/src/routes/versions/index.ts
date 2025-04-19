import versionsController from '../../controllers/versions'
import { Router } from 'express'
const router: Router = require('express').Router()

// READ
router.get('/', versionsController.getVersion)

export default router
