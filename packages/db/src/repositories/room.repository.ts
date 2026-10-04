import { eq, and, inArray } from "drizzle-orm";
import { db } from "../client";
import { rooms } from "../schema";
import { roomParticipants } from "../schema";

export const roomRepository = {
    async create (roomName: string, userId: string) {
        const [room]  = await db.insert(rooms).values({
            hostId: userId,
            roomName: roomName
        }) .returning()

        return room
    },

    async setVideo (roomId: string, videoId: string) {
        const [room] = await db.update(rooms)
            .set({ currentVideoId: videoId })
            .where(eq(rooms.id, roomId))
            .returning()
        
        return room
    },

    async findById (roomId: string) {
        return db.query.rooms.findFirst({ where: eq(rooms.id, roomId) })
    },

    async delete (roomId: string, userId: string) {
        await db.delete(rooms).where(
            and(eq(rooms.id, roomId), eq(rooms.hostId, userId)) 
        )
    },

    async listForUser(userId: string) {
        // salas onde o usuário é host
        const hosted = await db.query.rooms.findMany({ where: eq(rooms.hostId, userId) });

        // salas onde o usuário é participante aceito
        const participations = await db.query.roomParticipants.findMany({
            where: and(eq(roomParticipants.userId, userId), eq(roomParticipants.invitationStatus, "accepted")),
        });
        const participatingRoomIds = participations.map((p) => p.roomId);

        const participating = participatingRoomIds.length
            ? await db.query.rooms.findMany({ where: inArray(rooms.id, participatingRoomIds) })
            : [];

        // combina os dois, removendo duplicatas (se o host também aparecer em participants por algum motivo)
        const allRooms = [...hosted, ...participating];
        const uniqueRooms = Array.from(new Map(allRooms.map((r) => [r.id, r])).values());

        return uniqueRooms;
    }
}