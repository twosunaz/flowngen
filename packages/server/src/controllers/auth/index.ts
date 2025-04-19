import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { User } from '../../database/entities/User'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body
    console.log('controller firing')

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        })
    }

    try {
        const appServer = getRunningExpressApp()

        if (!appServer.AppDataSource?.isInitialized) {
            return res.status(503).json({
                success: false,
                message: 'Server is still initializing. Please try again shortly.'
            })
        }

        const userRepository = appServer.AppDataSource.getRepository(User)

        const user = await userRepository.findOne({
            where: { username },
            select: ['id', 'username', 'password', 'email', 'isActive', 'created_At', 'updated_At']
        })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            })
        }

        // 🔐 Create JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        )

        // Remove password before sending user info
        const { password: _, ...safeUser } = user

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: safeUser
        })
    } catch (err) {
        console.error(`[Auth] Login error:`, err)
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' })
        }

        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        // ✅ Check if user already exists
        const existing = await userRepo.findOneBy({ username })
        if (existing) {
            return res.status(409).json({ message: 'Username already taken' })
        }

        // Hash password and save new user
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User()
        newUser.username = username
        newUser.password = hashedPassword
        newUser.isActive = true

        await userRepo.save(newUser)

        res.status(201).json({ message: 'User registered successfully' })
    } catch (error) {
        next(error)
    }
}

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, newPassword } = req.body
        if (!username || !newPassword) {
            return res.status(400).json({ message: 'Username and new password required' })
        }

        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)
        const user = await userRepo.findOneBy({ username })

        if (!user) return res.status(404).json({ message: 'User not found' })

        user.password = await bcrypt.hash(newPassword, 10)
        await userRepo.save(user)

        res.status(200).json({ message: 'Password reset successfully' })
    } catch (error) {
        next(error)
    }
}

export default {
    login,
    register,
    resetPassword
    // existing login function, etc...
}
