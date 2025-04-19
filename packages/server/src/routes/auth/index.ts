// routes/auth/index.ts
import { login } from '../../controllers/auth'
import { Router } from 'express'
const router: Router = require('express').Router()

// Add this test route
router.get('/', (req, res) => {
    console.log('✅ /api/v1/auth hit')
    res.status(200).json({ message: 'Auth router is working!' })
})

router.post('/login', login)

export default router
