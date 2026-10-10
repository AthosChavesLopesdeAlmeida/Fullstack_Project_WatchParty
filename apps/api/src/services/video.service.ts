import { videosRepository } from "@watch-party/db";
import { CreateVideoInput } from "@watch-party/schemas";
import { deleteObject, generatePresignedUploadUrl, generatePresignedReadUrl } from "../lib/s3";
import { videoQueue } from "@watch-party/queue";
import { roomParticipantsRepository } from "@watch-party/db";

function extractKeyFromUrl(url: string): string {
  const parsed = new URL(url);
  return parsed.pathname.slice(1); // remove a barra inicial
}

export const videosService = {
    async createVideo (posterId: string, data: CreateVideoInput) {
        const { videoName } = data

        const rawKey = `${posterId}/${crypto.randomUUID()}-${videoName}`;
        const video = await videosRepository.create(posterId, videoName, rawKey);

        const uploadUrl = await generatePresignedUploadUrl(rawKey)

        return { video, uploadUrl }
    },

    async completeUpload (videoId: string, posterId: string) {
        const video = await videosRepository.findById(videoId)

        if (!video) throw new Error('Video not found')
        if (video.posterId !== posterId) throw new Error('Unauthorized')
              
        const updatedVideo = await videosRepository.markAsProcessing(videoId)
        // Adiciona à fila do Redis (que usa BullMQ)  
        await videoQueue.add("transcode", { 
            videoId: video.id,
            rawKey: video.rawKey,
        });

        return updatedVideo
    },

    async getVideo(videoId: string, requesterId: string) {
        const video = await videosRepository.findById(videoId);
        if (!video) throw new Error("Video not found");

        const isOwner = video.posterId === requesterId;
        const isRoomParticipant = await roomParticipantsRepository.isUserInRoomWithVideo(requesterId, videoId);
        // ^ método que ainda não existe, porque a tabela rooms/room_participants não existe ainda

        if (!isOwner && !isRoomParticipant) throw new Error("No authorization to watch this video");
        if (video.status !== "ready" || !video.processedUrl) {
            return { ...video, streamUrl: null };
        }

        const streamUrl = await generatePresignedReadUrl(extractKeyFromUrl(video.processedUrl));
        return { ...video, streamUrl };
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