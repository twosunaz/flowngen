import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { User } from '../../database/entities/User'

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

        const user = await userRepository.findOne({ where: { username } })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user
        })
    } catch (err) {
        console.error(`[Auth] Login error:`, err)
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
