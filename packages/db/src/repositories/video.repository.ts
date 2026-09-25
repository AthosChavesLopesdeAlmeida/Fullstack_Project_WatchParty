import { videos } from "../schema";
import { db } from "../client";
import { eq } from "drizzle-orm";

export const videosRepository = {
    async create (posterId: string, videoName: string, rawKey: string) {
        const [video] = await db.insert(videos).values({
            posterId: posterId,
            videoName: videoName,
            rawKey: rawKey,
            status: 'pending'
        }).returning()

        return video
    },

    async findById (id: string) {
        return db.query.videos.findFirst({ where: eq(videos.id, id)})
    },

    async markAsProcessing (id: string) {
        const [video] = await db
            .update(videos)
            .set({ status: 'processing' })
            .where(eq(videos.id, id))
            .returning()
        return video
    },

    async markAsReady (id: string, processedUrl: string) {
        const [video] = await db
            .update(videos)
            .set({ status: 'ready', processedUrl: processedUrl })
            .where(eq(videos.id, id))
            .returning()
        return video
    },

    async markAsFailed (id: string) {
        const [video] = await db   
            .update(videos)
            .set({ status: 'failed' })
            .where(eq(videos.id, id))
            .returning()
        return video
    },

    async delete (id: string) {
        return await db.delete(videos).where(
            eq(videos.id, id)
        )
    },

    async listByUser (posterId: string) {
        return await db.query.videos.findMany({
            where: eq(videos.posterId, posterId)
        })
    }
}