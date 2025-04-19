import getUploadPathController from '../../controllers/get-upload-path'
import { Router } from 'express'
const router: Router = require('express').Router()

// READ
router.get('/', getUploadPathController.getPathForUploads)

export default router
