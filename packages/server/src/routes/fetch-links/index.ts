import fetchLinksController from '../../controllers/fetch-links'
import { Router } from 'express'
const router: Router = require('express').Router()

// READ
router.get('/', fetchLinksController.getAllLinks)

export default router
