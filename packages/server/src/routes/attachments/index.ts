import attachmentsController from '../../controllers/attachments'
import { getMulterStorage } from '../../utils'
import { Router } from 'express'
const router: Router = require('express').Router()

// CREATE
router.post('/:chatflowId/:chatId', getMulterStorage().array('files'), attachmentsController.createAttachment)

export default router
