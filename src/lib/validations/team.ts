import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  lead: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});

export const updateTeamSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  lead: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  members: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
