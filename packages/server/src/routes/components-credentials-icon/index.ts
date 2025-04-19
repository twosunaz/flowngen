import componentsCredentialsController from '../../controllers/components-credentials'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE

// READ
router.get(['/', '/:name'], componentsCredentialsController.getSingleComponentsCredentialIcon)

// UPDATE

// DELETE

export default router
