// routes/auth/index.ts
import authController from '../../controllers/auth'
import { Router } from 'express'
const router: Router = require('express').Router()

router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/reset-password', authController.resetPassword)
router.post('/forgot-password', authController.forgotPassword)

router.get('/verify-email', authController.verifyEmail)

export default router
