// types/express/index.d.ts
import 'express'

declare global {
    namespace Express {
        interface User {
            id: string
            username: string
            userId: string
        }

        interface Request {
            user?: User
        }
    }
}
