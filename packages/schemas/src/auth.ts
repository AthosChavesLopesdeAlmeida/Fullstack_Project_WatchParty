import { z } from 'zod'

export const registerSchema = z.object({
  email: z.email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  pfp: z.string()
});

export type RegisterInput = z.infer<typeof registerSchema>;