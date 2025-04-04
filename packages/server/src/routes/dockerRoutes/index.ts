// /server/src/routes/dockerRoutes.ts

import express from 'express'
import { createDockerInstance } from '../controllers/dockerController'

const router = express.Router()

router.post('/create-docker', createDockerInstance)

export default router
