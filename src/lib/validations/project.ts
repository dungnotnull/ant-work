import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name required").max(100),
  description: z.string().max(1000).optional(),
  team: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid team ID"),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  notes: z.string().max(5000).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
