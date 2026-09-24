import { videos } from "../schema";
import { db } from "../client";
import { eq } from "drizzle-orm";

export const videosRepository = {
    async create (posterId: string, videoName: string, rawKey: string) {
        const video = db.insert(videos).values({
            posterId: posterId,
            videoName: videoName,
            rawKey: rawKey,
            status: 'pending'
        })

        return video
    },

    async findById (id: string) {
        return db.query.videos.findFirst({ where: eq(videos.id, id)})
    },

    async markAsProcessing (id: string) {

    }
}