import { z } from 'zod'

export const registerSchema = z.object({
  email: z.email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  pfp: z.string().optional()
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const deleteSchema = z.object({
  password: z.string().min(8),
});


export type RegisterInput = z.infer<typeof registerSchema>;