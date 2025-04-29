import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

interface JwtPayload {
    userId: string
    username: string
    iat?: number
    exp?: number
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    // if (!token) {
    //     console.log('[verifyToken] Missing token')
    //     return res.status(401).json({ success: false, message: 'Missing token' })
    // }
    if (!token) {
        console.log('[verifyToken] Missing token')
        const acceptsHtml = req.accepts(['html', 'json']) === 'html'
        return acceptsHtml ? res.redirect('/chatflows') : res.status(401).json({ success: false, message: 'Missing token' })
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload

        req.user = {
            id: payload.userId,
            userId: payload.userId,
            username: payload.username
        }

        console.log('[verifyToken] Token verified. Payload:', payload)
        next()
    } catch (err) {
        console.log('[verifyToken] Token invalid or expired:', err)
        return res.status(403).json({ success: false, message: 'Invalid or expired token' })
    }
}
