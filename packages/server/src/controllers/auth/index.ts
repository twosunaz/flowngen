import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { User } from '../../database/entities/User'
import { randomBytes } from 'crypto'
import { sendVerificationEmail } from '../../utils/email'
import * as crypto from 'crypto'
import { sendResetEmail } from '../../utils/email'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

const login = async (req: Request, res: Response) => {
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
        const { username, password, email } = req.body
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Username, password, and email are required' })
        }

        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        // ✅ Check if user already exists
        const existing = await userRepo.findOneBy({ username })
        if (existing) {
            return res.status(409).json({ message: 'Username already taken' })
        }

        // ✅ Generate hashed password and verification token
        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationToken = randomBytes(32).toString('hex')

        // ✅ Save new user
        const newUser = new User()
        newUser.username = username
        newUser.password = hashedPassword
        newUser.email = email
        newUser.isActive = true
        newUser.isVerified = false
        newUser.verificationToken = verificationToken

        await userRepo.save(newUser)

        // ✅ Send verification email
        await sendVerificationEmail(email, verificationToken)

        res.status(201).json({ message: 'User registered. Please verify your email.' })
    } catch (error) {
        next(error)
    }
}
const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ message: 'Email is required' })
        }

        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const user = await userRepo.findOneBy({ email })
        if (!user) return res.status(404).json({ message: 'User not found' })

        const token = crypto.randomBytes(32).toString('hex')
        user.resetToken = token
        await userRepo.save(user)

        const resetUrl = `${process.env.RESET_PASSWORD_URL}${token}`
        await sendResetEmail(email, token)

        res.status(200).json({ message: 'Reset link sent' })
    } catch (error) {
        next(error)
    }
}

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, newPassword } = req.body
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Reset token and new password required' })
        }

        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const user = await userRepo.findOneBy({ resetToken: token })
        if (!user) return res.status(404).json({ message: 'Invalid or expired reset token' })

        user.password = await bcrypt.hash(newPassword, 10)
        user.resetToken = null // Invalidate the token
        await userRepo.save(user)

        res.status(200).json({ message: 'Password reset successfully' })
    } catch (error) {
        next(error)
    }
}

const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query

        if (!token || typeof token !== 'string') {
            return res.redirect('https://app.flowngen.com/email-verified?status=invalid-token')
        }

        const appServer = getRunningExpressApp()
        const userRepo = appServer.AppDataSource.getRepository(User)

        const user = await userRepo.findOneBy({ verificationToken: token })

        if (!user) {
            return res.redirect('https://app.flowngen.com/email-verified?status=not-found')
        }

        user.isVerified = true
        user.verificationToken = null // Optional: clear the token
        await userRepo.save(user)

        // ✅ Redirect to a frontend page on success
        return res.redirect('https://app.flowngen.com/email-verified?status=success')
    } catch (err) {
        console.error('[verifyEmail] Error verifying email:', err)
        return res.redirect('https://app.flowngen.com/email-verified?status=error')
    }
}

export default {
    verifyEmail,
    login,
    register,
    resetPassword,
    forgotPassword
    // existing login function, etc...
}
