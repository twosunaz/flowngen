// controllers/auth/index.ts
import { Request, Response } from 'express'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'

const dbPath = path.join(__dirname, '../../../docker/staging.db')

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body

    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password])

        if (user) {
            res.status(200).json({ success: true, message: 'Login successful', user })
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' })
        }

        await db.close()
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ success: false, message: 'Internal server error' })
    }
}
