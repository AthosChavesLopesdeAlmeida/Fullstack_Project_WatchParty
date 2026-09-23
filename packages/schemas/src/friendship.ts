import { z } from 'zod'

export const sendRequestSchema = z.object({
    addresseeEmail: z.email()
})

export type SendRequestInput = z.infer<typeof sendRequestSchema>