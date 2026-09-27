import { eq, and } from "drizzle-orm";
import { db } from "../client";
import { rooms } from "../schema";

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
    }
}