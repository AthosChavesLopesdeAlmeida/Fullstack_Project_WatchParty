import { Request, Response } from "express";
import { registerSchema, loginSchema, deleteSchema } from '@watch-party/schemas'
import { authService } from "../services/auth.service";

// Quando há token (com ID) na request, usamos este extend
export interface AuthRequest extends Request {
  userId?: string;
}

export const authController = {
    async register (req: Request, res: Response) {
        const data = registerSchema.parse(req.body)
        const isProduction = process.env.NODE_ENV === 'production'

        try {
            const { email, password, username, pfp } = data
            const { user, token } = await authService.register(email, password, username, pfp)

            res.cookie('token', token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7,
                path: '/'
            })
            
            res.status(201).json({user: { id: user.id, email: user.email, username: user.username }})
        } catch {
            res.status(401).json({ error: 'Invalid data' })
        }
    },

    async login (req: Request, res: Response) {
        const data = loginSchema.parse(req.body)
        const isProduction = process.env.NODE_ENV === 'production'    

        try {
            const { email, password } = data
            const { user, token } = await authService.login(email, password)

            res.cookie('token', token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7,
                path: '/'
            })    

            res.status(200).json({user: { id: user.id, email: user.email, username: user.username }})
        } catch {
            res.status(401).json({ error: 'Invalid data' })
        }
    },

    async delete (req: AuthRequest, res: Response) {
        const data = deleteSchema.parse(req.body)
        const userId = req.userId! 

        try {
            const { password } = data

            await authService.delete(userId, password)

            res.clearCookie('token', { path: '/' })
            res.status(204).send()
        } catch {
            res.status(401).json({ error: 'User not found' })
        }
    },

    async logout(req: Request, res: Response) {
        res.clearCookie('token', { path: '/' });
        res.json({ message: 'Logout realizado' });
    }
}
