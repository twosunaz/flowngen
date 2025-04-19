// routes/auth/index.ts
import authController from '../../controllers/auth'
import { Router } from 'express'
const router: Router = require('express').Router()

// Add this test route
router.get('/', (req, res) => {
    console.log('✅ /api/v1/auth hit')
    res.status(200).json({ message: 'Auth router is working!' })
})

router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/reset-password', authController.resetPassword)

export default router
