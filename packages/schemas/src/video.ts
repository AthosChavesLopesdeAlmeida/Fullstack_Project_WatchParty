import { z } from "zod";

export const createVideoSchema = z.object({
  videoName: z.string().min(1).max(255),
});

export type CreateVideoInput = z.infer<typeof createVideoSchema>;