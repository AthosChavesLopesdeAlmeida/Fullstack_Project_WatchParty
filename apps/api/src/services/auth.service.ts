import { userRepository } from "@watch-party/db";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET!

export const authService = {
    async register (email: string, password: string, username: string, pfp?: string) {
        // Todos os campos (exceto pfp) são obrigatórios
        if (!email || !password || !username) {
            throw new Error('Missing information')
        }

        // Verifica se o email já foi cadastrado
        const existing = await userRepository.findByEmail(email)
        if (existing) throw new Error('Email already registered')

        // Criptografa a senha
        const passwordHash = await bcrypt.hash(password, 10)
        const user = await userRepository.create(email, passwordHash, username, pfp)

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
        return { user: {id: user.id, username: user.username, email: user.email}, token }
    },

    async login (email: string, password: string) {
        // Todos os campos são obrigatórios
        if (!email || !password ) {
            throw new Error('Missing information')
        }

        // Verifica se o email já foi cadastrado
        const user = await userRepository.findByEmail(email)
        if (!user) throw new Error('Account not found')
 
        // Compara a senha
        const passwordIsValid = await bcrypt.compare(password, user.passwordHash)
        if (!passwordIsValid) throw new Error('Invalid password')

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
        return { user: {id: user.id, username: user.username, email: user.email}, token }
    },

    async delete (id: string, password: string) {
        // Todos os campos são obrigatórios
        if (!password) {
            throw new Error('Missing information')
        }

        // Verifica a existência da conta 
        const user = await userRepository.findById(id)
        if (!user) throw new Error('Account not found')

        // Compara a senha
        const passwordIsValid = await bcrypt.compare(password, user.passwordHash)
        if (!passwordIsValid) throw new Error('Invalid password')

        await userRepository.delete(id, password)
    }
}