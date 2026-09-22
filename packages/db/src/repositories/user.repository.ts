import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { users } from "../schema";

export const userRepository = {
    async findById(id: string) {
        return await db.query.users.findFirst({ where: eq(users.id, id) })
    },

    async findByEmail(email: string) {
        return await db.query.users.findFirst({ where: eq(users.email, email) })
    },

    async create(email: string, passwordHash: string, username: string, pfp?: string) {
        const [user] = await db.insert(users).values({ email: email, passwordHash: passwordHash, username: username, pfp: pfp }).returning()
        return user
    },

    // Precisa do ID do usuário para excluir conta e senha para confirmar
    async delete (id: string, passwordHash: string) {
        return await db.delete(users).where(
            and(
                eq(users.id, id), eq(users.passwordHash, passwordHash)
            )
        )
    }
}