// controllers/auth/index.ts
import { Request, Response } from 'express'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import fs from 'fs'

const dbPath = '/usr/src/staging.db'

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body
    console.log('Login endpoint hit', req.body)
    try {
        console.log('📂 DB Exists in container:', fs.existsSync('/usr/src/staging.db'))
        console.log('📁 CWD:', process.cwd())

        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password])

        console.log('🔍 Query Result:', user)
        console.log('Login payload:', { username, password })

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
