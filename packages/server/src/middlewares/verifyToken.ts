// middleware/verifyToken.ts
console.log('🔥 [verifyToken] Middleware triggered')
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'
console.log('🟢 verifyToken middleware loaded')
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    console.log('[verifyToken] Incoming auth header:', req.headers['authorization'])
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        console.log('[verifyToken] Missing token')
        return res.status(401).json({ success: false, message: 'Missing token' })
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET)
        ;(req as any).user = payload
        console.log('[verifyToken] Token verified. Payload:', payload)
        next()
    } catch (err) {
        console.log('[verifyToken] Token invalid or expired:', err)
        return res.status(403).json({ success: false, message: 'Invalid or expired token' })
    }
}
