import getUploadFileController from '../../controllers/get-upload-file'
import { Router } from 'express'
const router: Router = require('express').Router()

// READ
router.get('/', getUploadFileController.streamUploadedFile)

export default router
