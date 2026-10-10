import { Request, Response } from 'express'
import { roomService } from '../services/rooms.service'
import { createRoomSchema } from '@watch-party/schemas'

export interface AuthRequest<P = {}> extends Request<P> {
  userId?: string;
}

export const roomController = {
    async create (req: AuthRequest, res: Response) {
        const userId = req.userId!
        
        try {
            const data = createRoomSchema.parse(req.body)
            const room = await roomService.create(userId, data)
            res.status(201).json({room})
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to create room'
            res.status(400).json({ error: message })
        }
    },

    async setVideo (req: AuthRequest<{ roomId: string, videoId: string }>, res: Response) {
        const userId = req.userId!

        const { roomId, videoId } = req.params;

        try {
            const room = await roomService.setVideo(roomId, videoId, userId)
            res.status(200).json({room})
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to set video'
            res.status(400).json({ error: message })
        }
    },

    async delete (req: AuthRequest<{ roomId: string }>, res: Response) {
        const userId = req.userId!

        const { roomId } = req.params;      

        try {
            await roomService.delete(roomId, userId)
            res.status(204).send()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to delete the room'
            res.status(404).json({ error: message })
        }
    },

    async listMyRooms(req: AuthRequest, res: Response) {
        const userId = req.userId!;
        try {
            const rooms = await roomService.listMyRooms(userId);
            res.status(200).json({ rooms });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to list rooms";
            res.status(400).json({ error: message });
        }
    },

    async findById (req: AuthRequest<{ roomId: string }>, res: Response) {
        const { roomId } = req.params;    

        try {
            const rooms = await roomService.findById(roomId);
            res.status(200).json({ rooms });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to list rooms";
            res.status(400).json({ error: message });
        }
    }
}