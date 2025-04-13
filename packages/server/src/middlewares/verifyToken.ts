// middleware/verifyToken.ts
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.status(401).json({ success: false, message: 'Missing token' })

    try {
        const payload = jwt.verify(token, JWT_SECRET)
        ;(req as any).user = payload
        next()
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' })
    }
}
