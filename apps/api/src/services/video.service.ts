import { videosRepository } from "@watch-party/db";
import { CreateVideoInput } from "@watch-party/schemas";

export const videosService = {
    async createVideo (posterId: string, data: CreateVideoInput) {
        const { videoName } = data

        const rawKey = `${posterId}/${crypto.randomUUID()}-${videoName}`;
        const video = await videosRepository.create(posterId, videoName, rawKey);

        // 25/09 - Funcionalidades de fila e worker ainda não criadas
        const uploadUrl = await generatePressignedUploadUrl(rawKey, {
            maxSizeBytes: 500 * 1024 * 1024
        })

        return { video, uploadUrl }
    },

    async completeUpload (videoId: string, posterId: string) {
        const video = await videosRepository.findById(videoId)

        if (!video) throw new Error('Video not found')
        if (video.posterId !== posterId) throw new Error('Unauthorized')

        // 25/09 - Funcionalidades de fila e worker ainda não criadas   
        await videoQueue.add("transcode", { 
            videoId: video.id,
            rawKey: video.rawKey,
        });

        return video
    },

    async getVideo(videoId: string, requesterId: string) {
        const video = await videosRepository.findById(videoId);
        if (!video) throw new Error("Video not found");

        const isOwner = video.posterId === requesterId;
        const isRoomParticipant = await roomParticipantRepository.isUserInRoomWithVideo(requesterId, videoId);
        // ^ método que ainda não existe, porque a tabela rooms/room_participants não existe ainda

        if (!isOwner && !isRoomParticipant) throw new Error("No authorization to watch this video");
        return video;
    },

    async listMyVideos (posterId: string) {
        const videos = await videosRepository.listByUser(posterId)
        return videos
    },

    async deleteVideo (videoId: string, posterId: string) {
        const video = await videosRepository.findById(videoId)
        if (!video) throw new Error("Video not found")

        if (video.posterId !== posterId) throw new Error("Unauthorized")

        // apaga o arquivo bruto (sempre existe) (ainda não implementado)
        await deleteObject(video.rawKey);

        // apaga o processado também, se já tiver sido gerado (ainda não implementado)
        if (video.processedUrl) {
            const processedKey = extractKeyFromUrl(video.processedUrl);
            await deleteObject(processedKey);
        }

        await videosRepository.delete(videoId);
    }
}