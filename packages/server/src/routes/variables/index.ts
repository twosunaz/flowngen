import variablesController from '../../controllers/variables'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE
router.post('/', variablesController.createVariable)

// READ
router.get('/', variablesController.getAllVariables)

// UPDATE
router.put(['/', '/:id'], variablesController.updateVariable)

// DELETE
router.delete(['/', '/:id'], variablesController.deleteVariable)

export default router
