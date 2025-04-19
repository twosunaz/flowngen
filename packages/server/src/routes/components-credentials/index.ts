import componentsCredentialsController from '../../controllers/components-credentials'
import { Router } from 'express'
const router: Router = require('express').Router()

// READ
router.get('/', componentsCredentialsController.getAllComponentsCredentials)
router.get(['/', '/:name'], componentsCredentialsController.getComponentByName)

export default router
