import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { User } from '../../database/entities/User'

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        })
    }

    try {
        const appServer = getRunningExpressApp()
        const userRepository = appServer.AppDataSource.getRepository(User)

        const user = await userRepository.findOne({ where: { username } })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
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
