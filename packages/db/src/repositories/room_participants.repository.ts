import { eq, and } from "drizzle-orm";
import { db } from "../client";
import { users, roomParticipants } from "../schema";
import { rooms } from "../schema";

export const roomParticipantsRepository = {
    async invite (invitedId: string, roomId: string) {
        const [invitation] = await db.insert(roomParticipants).values({
            userId: invitedId,
            roomId: roomId,
            invitationStatus: "pending"
        }).returning()

        return invitation
    },

    async enterRoom (invitedId: string, roomId: string) {
        const [invitation] = await db.update(roomParticipants)
            .set({ invitationStatus: "accepted" })
            .where(and(eq(roomParticipants.userId, invitedId), eq(roomParticipants.roomId, roomId)))
            .returning()

        return invitation
    },

    async listParticipants (roomId: string) {
        // Faz um join dos participantes com a tabela de usuários, se forem usuário aceitos na sala
        return db
            .select({
            userId: users.id,
            username: users.username,
            pfpUrl: users.pfp, // mesmo mapeamento do /auth/me
            })
            .from(roomParticipants)
            .innerJoin(users, eq(roomParticipants.userId, users.id))
            .where(
            and(
                eq(roomParticipants.roomId, roomId),
                eq(roomParticipants.invitationStatus, "accepted"),
            ),
            );
    },
    
    async listRoomsByUser (userId: string) {
        return await db.query.roomParticipants.findMany({ where: eq(roomParticipants.userId, userId) })
    },

    async remove (userId: string, roomId: string) {
        return await db.delete(roomParticipants).where(
            and(
                eq(roomParticipants.userId, userId),
                eq(roomParticipants.roomId, roomId)
            )
        )
    },

    async isUserInRoomWithVideo(userId: string, videoId: string): Promise<boolean> {
        const result = await db
        .select({ userId: roomParticipants.userId })
        .from(roomParticipants)
        .innerJoin(rooms, eq(roomParticipants.roomId, rooms.id))
        .where(
            and(
            eq(roomParticipants.userId, userId),
            eq(roomParticipants.invitationStatus, "accepted"),
            eq(rooms.currentVideoId, videoId),
            ),
        )
        .limit(1);

        return result.length > 0;
    },

    // Verifica se o usuário é um participante da sala e está aceito
    async isAcceptedParticipant(userId: string, roomId: string): Promise<boolean> {
    const result = await db
        .select({ userId: roomParticipants.userId })
        .from(roomParticipants)
        .where(
        and(
            eq(roomParticipants.userId, userId),
            eq(roomParticipants.roomId, roomId),
            eq(roomParticipants.invitationStatus, "accepted"),
        ),
        )
        .limit(1);

    return result.length > 0;
    },
};
