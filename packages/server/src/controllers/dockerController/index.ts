import { Request, Response } from 'express'
import { exec } from 'child_process'

// Simulated user check (replace with actual DB call)
const verifyUser = async (username: string, password: string): Promise<boolean> => {
    // TODO: Replace with real DB verification logic
    return username === 'admin' && password === 'secure123'
}

const createDockerInstance = async (req: Request, res: Response) => {
    const { username, password } = req.body

    try {
        const isValid = await verifyUser(username, password)

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const containerName = `flowise_instance_${username.toLowerCase()}`
        const command = `docker run -d --name ${containerName} -p 0:3000 flowiseai/flowise`

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Docker error: ${error.message}`)
                return res.status(500).json({ message: 'Docker failed to start', error: error.message })
            }
            return res.status(200).json({ message: 'Container created', containerId: stdout.trim() })
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}

export { createDockerInstance }
