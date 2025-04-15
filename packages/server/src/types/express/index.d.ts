// src/types/express/index.d.ts
import 'express'

declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            id: string
            username: string
            // Add any other fields from your JWT payload if needed
        }
    }
}
