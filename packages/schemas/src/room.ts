import { z } from 'zod'

export const createRoomSchema = z.object({
    roomName: z.string().min(3).max(60)
})

export type createRoomInput = z.infer<typeof createRoomSchema>