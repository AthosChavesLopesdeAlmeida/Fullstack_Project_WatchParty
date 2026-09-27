import { eq, and } from "drizzle-orm";
import { db } from "../client";
import { roomParticipants } from "../schema";
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
        return await db.query.roomParticipants.findMany({ where: eq(roomParticipants.roomId, roomId) })
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
};
