import { sendRequestSchema } from "@watch-party/schemas";
import { Request, Response } from "express";
import { friendshipService } from "../services/friendship.service";

// Quando há token (com ID) na request, usamos este extend
export interface AuthRequest<P = {}> extends Request<P> {
  userId?: string;
}

export const friendshipController = {
    async sendRequest (req: AuthRequest, res: Response) {
        const userId = req.userId!
        const data = sendRequestSchema.parse(req.body)

        try {
            const friendRequest = await friendshipService.sendRequest(userId, data)
            res.status(201).json({friendRequest})
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to send request'
            res.status(400).json({ error: message })
        }
    },

    async acceptRequest (req: AuthRequest<{ friendshipId: string }>, res: Response) {
        const userId = req.userId!
        const { friendshipId } = req.params        

        try {
            await friendshipService.acceptRequest(friendshipId, userId)
            res.status(200).send()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to accept request'
            res.status(404).json({ error: message })
        }
    },

    async rejectRequest (req: AuthRequest<{ friendshipId: string }>, res: Response) {
        const userId = req.userId!
        const { friendshipId } = req.params        

        try {
            await friendshipService.rejectRequest(friendshipId, userId)
            res.status(200).send()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to reject request'
            res.status(404).json({ error: message })
        }
    },

    async removeFriend (req: AuthRequest<{ friendshipId: string }>, res: Response) {
        const userId = req.userId!
        const { friendshipId } = req.params
        try {
            await friendshipService.removeFriend(friendshipId, userId)
            res.status(204).send()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to remove friend'
            res.status(404).json({ error: message })
        }
    },

    async listFriends (req: AuthRequest, res: Response) {
        const userId  = req.userId!

        try {
            const friends = await friendshipService.listFriends(userId)
            res.status(200).json({friends})
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to list friends'
            res.status(401).json({ error: message })
        }
    },

    async listPendingRequests (req: AuthRequest, res: Response) {
        const userId  = req.userId!

        try {
            const pendingRequests = await friendshipService.listPendingRequests(userId)
            res.status(200).json({pendingRequests})
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to list pending requests'
            res.status(401).json({ error: message })
        }
    }
} 