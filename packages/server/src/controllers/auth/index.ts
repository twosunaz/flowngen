import { Request, Response } from 'express'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { User } from '../../database/entities/User'
import bcrypt from 'bcrypt'

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body
    console.log('Login endpoint hit', req.body)

    try {
        const appServer = getRunningExpressApp()
        const userRepository = appServer.AppDataSource.getRepository(User)

        const user = await userRepository.findOne({ where: { username } })

        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({ success: true, message: 'Login successful', user })
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' })
        }
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
}
