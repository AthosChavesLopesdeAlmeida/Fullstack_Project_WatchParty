import { Request, Response } from "express";
import { videosService } from "../services/video.service";
import { createVideoSchema } from "@watch-party/schemas";

// Quando há parâmetros na request, usamos este extend
export interface AuthRequest<P = {}> extends Request<P> {
  userId?: string;
}

export const videosController = {
    async createVideo (req: AuthRequest, res: Response) {
        const userId = req.userId!
        const data = createVideoSchema.parse(req.body)

        try {
            const video = await videosService.createVideo(userId, data)
            res.status(201).json({video})
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to create video'
            res.status(400).json({ error: message })
        }
    },

    async completeUpload(req: AuthRequest<{ videoId: string }>, res: Response) {
        const userId = req.userId!;
        const { videoId } = req.params;

        try {
            const video = await videosService.completeUpload(videoId, userId);
            res.status(200).json({ video });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to complete upload";
            res.status(400).json({ error: message });
        }
    },

    async getVideo (req: AuthRequest<{ videoId: string }>, res: Response) {
        const userId = req.userId!;
        const { videoId } = req.params;

        try {
            const video = await videosService.getVideo(videoId, userId);
            res.status(200).json({ video });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to find video";
            res.status(400).json({ error: message });
        }
    },

    async listMyVideos (req: AuthRequest, res: Response) {
        const userId = req.userId!

        try {
            const videos = await videosService.listMyVideos(userId)
            res.status(200).json({ videos })
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to find videos"
            res.status(404).json({ error: message })
        }
    },

    async deleteVideo (req: AuthRequest<{ videoId: string }>, res: Response) {
        const userId = req.userId!
        const { videoId } = req.params

        try {
            await videosService.deleteVideo(videoId, userId)
            res.status(204).send()
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to delete video"
            res.status(400).json({ error: message })        

        }
    }

}