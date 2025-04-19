import apikeyController from '../../controllers/apikey'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE
router.post('/', apikeyController.createApiKey)
router.post('/import', apikeyController.importKeys)

// READ
router.get('/', apikeyController.getAllApiKeys)

// UPDATE
router.put(['/', '/:id'], apikeyController.updateApiKey)

// DELETE
router.delete(['/', '/:id'], apikeyController.deleteApiKey)

export default router
