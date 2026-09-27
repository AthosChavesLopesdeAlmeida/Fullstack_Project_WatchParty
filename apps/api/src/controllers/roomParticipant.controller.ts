import { Request, Response } from "express";
import { roomParticipantsService } from "../services/room_participants.services";

export interface AuthRequest<P = {}> extends Request<P> {
  userId?: string;
}

export const roomParticipantsController = {
    async invite (req: AuthRequest<{ roomId: string, invitedId: string }>, res: Response) {
        const userId = req.userId!
        const { roomId, invitedId } = req.params

        try {
            const invitation = await roomParticipantsService.invite(userId, invitedId, roomId)
            res.status(201).json({ invitation })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to invite user'
            res.status(400).json({ error: message })
        }
    },

    async enterRoom(req: AuthRequest<{ roomId: string }>, res: Response) {
        const userId = req.userId!;
        const { roomId } = req.params;

        try {
            const invitation = await roomParticipantsService.enterRoom(userId, roomId);
            res.status(200).json({ invitation });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to enter room";
            res.status(400).json({ error: message });
        }
    },

    async remove (req: AuthRequest<{ roomId: string }>, res: Response) {
        const userId = req.userId!
        const { roomId } = req.params

        try {
            await roomParticipantsService.remove(userId, roomId, userId)
            res.status(204).send()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to remove user from the room'
            res.status(404).json({ error: message })
        }
    },

    async listParticipants (req: AuthRequest<{ roomId: string }>, res: Response) {
        const { roomId } = req.params

        try {
            const participants = await roomParticipantsService.listParticipants(roomId)
            res.status(200).json({ participants })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to list users'
            res.status(400).json({ error: message })
        }
    },

    async kick(req: AuthRequest<{ roomId: string; targetUserId: string }>, res: Response) {
        const requesterId = req.userId!;
        const { roomId, targetUserId } = req.params;

        try {
            await roomParticipantsService.remove(targetUserId, roomId, requesterId);
            res.status(204).send();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to remove participant";
            res.status(400).json({ error: message });
        }
    },
}