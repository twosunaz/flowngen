// routes/auth/index.ts
import express from 'express'
import { login } from '../../controllers/auth'

const router = express.Router()

// Add this test route
router.get('/', (req, res) => {
    console.log('✅ /api/v1/auth hit')
    res.status(200).json({ message: 'Auth router is working!' })
})

router.post('/login', login)

export default router
