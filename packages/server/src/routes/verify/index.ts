import apikeyController from '../../controllers/apikey'
import { Router } from 'express'
const router: Router = require('express').Router()

// READ
router.get(['/apikey/', '/apikey/:apikey'], apikeyController.verifyApiKey)

export default router
