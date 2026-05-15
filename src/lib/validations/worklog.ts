import { z } from "zod";

export const createWorkLogSchema = z.object({
  hours: z.number().min(0.25).max(24),
  description: z.string().min(1).max(500),
  date: z.string().datetime(),
});

export type CreateWorkLogInput = z.infer<typeof createWorkLogSchema>;
