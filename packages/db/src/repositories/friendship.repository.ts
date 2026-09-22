import { db } from "../client";
import { or, eq, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { friendships, users } from "../schema";

export const friendshipRepository = {
    // Encontra uma amizade em cada um dos usuários tenha um dos IDs, independente da direção
    async findBetween (userIdA: string, userIdB: string) {
        return db.query.friendships.findFirst({where: or (
            and(eq(friendships.requesterId, userIdA), eq(friendships.addresseeId, userIdB)),
            and(eq(friendships.requesterId, userIdB), eq(friendships.addresseeId, userIdA))
        )})
    },

    // Cria uma amizade (com status pendente)
    async create (requesterId: string, addresseeId: string) {
        const [friendship] = await db
            .insert(friendships)
            .values({ requesterId, addresseeId })
            .returning()
        return friendship
    },

    // Encontra uma por ID
    async findById (friendshipId: string) {
        return db.query.friendships.findFirst({
            where: eq(friendships.id, friendshipId)
        })
    },

    // Muda o status do pedido de amizade para "accepted"
    async updateStatus (friendshipId: string, status: "accepted") {
        const [friendship] = await db  
            .update(friendships)
            .set({ status, respondedAt: new Date() })
            .where(eq(friendships.id, friendshipId))
            .returning()
        return friendship
    },

    // Lista as pendentes de determinado destinatário
    async listPendingReceived (userId: string) {
        return db.query.friendships.findMany({
            where: and(eq(friendships.addresseeId, userId), eq(friendships.status, 'pending'))
        })
    },

    // Precisa do ID da amizade e do ID de algum dos dois (userId, no caso)
    async delete (friendshipId: string, userId: string) {
        return await db.delete(friendships).where(
            and(
                eq(friendships.id, friendshipId), or(eq(friendships.requesterId, userId), 
                eq(friendships.addresseeId, userId))
            )
        )
    },

    async listByUser (userId: string, status: 'pending' | 'accepted' = 'accepted') {
        // usa alias() porque a tabela users precisa ser "joinada" duas vezes 
        // (uma para pegar dados do requester, outra do addressee)
        const requesterUser = alias(users, "requester_user");
        const addresseeUser = alias(users, "addressee_user");

        const rows = await db
            // Retorna vários dados da amizade e dos seus usuários
            .select({
                friendshipId: friendships.id,
                status: friendships.status,
                requesterId: friendships.requesterId,
                addresseeId: friendships.addresseeId,
                // Vêm da tabela dos usuários
                requesterUsername: requesterUser.username,
                addresseeUsername: addresseeUser.username
            })
            .from(friendships)
            .innerJoin(requesterUser, eq(friendships.requesterId, requesterUser.id))
            .innerJoin(addresseeUser, eq(friendships.addresseeId, addresseeUser.id))
            .where(
                // Onde o status é igual ao do parâmetro
                // E o id do usuário é de algum dos participantes da amizade
                and(
                    eq(friendships.status, status),
                    or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId))
                )
            )

        // Normaliza o resultado, retornando os dados do outro usuário (o seu amigo)
        return rows.map((row) => {
            const isRequester = row.requesterId === userId
            return {
                friendshipId: row.friendshipId,
                status: row.status,
                friendId: isRequester ? row.addresseeId : row.requesterId,
                friendUsername: isRequester ? row.addresseeUsername : row.requesterUsername
            }
        })
    }
}