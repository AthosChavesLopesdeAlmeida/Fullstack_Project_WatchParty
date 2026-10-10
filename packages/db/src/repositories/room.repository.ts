import { eq, and, inArray } from "drizzle-orm";
import { db } from "../client";
import { rooms } from "../schema";
import { roomParticipants } from "../schema";
import { randomUUID } from "node:crypto";

export const roomRepository = {
    async create (roomName: string, userId: string) {
        const roomId = randomUUID();

        // Em uma operação atômica, cria a sala e assinala o host como participante
        const [insertedRooms] = await db.batch([
            db.insert(rooms).values({ id: roomId, hostId: userId, roomName }).returning(),
            db.insert(roomParticipants).values({ userId, roomId, invitationStatus: "accepted" }),
        ]);

        return insertedRooms[0];
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
    },

    async setHost(roomId: string, newHostId: string) {
        await db.update(rooms).set({ hostId: newHostId }).where(eq(rooms.id, roomId));
    },
}