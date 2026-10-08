import { userRepository } from "@watch-party/db";
import { DeleteInput, LoginInput, RegisterInput } from "@watch-party/schemas";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET!

export const authService = {
    async register (data: RegisterInput) {
        const { email, password, username, pfp } = data;

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

    async login (data: LoginInput) {
        const { email, password } = data

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

    async delete (id: string, data: DeleteInput) {
        const { password } = data
        
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
    },

    async verify(token: string | undefined) {
        if (!token) throw new Error("Token ausente");

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            return { userId: decoded.userId };
        } catch {
            throw new Error("Token inválido ou expirado");
        }
    },

    async getProfile(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw new Error("User not found")

    // nunca devolva passwordHash
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        pfpUrl: user.pfp, // a coluna no banco se chama "pfp", o tipo do front usa "pfpUrl"
        createdAt: user.createdAt,
    }
    },
}