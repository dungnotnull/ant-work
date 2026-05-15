import { z } from "zod";
import { TASK_STATUSES, PRIORITIES } from "@/lib/constants";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const createEpicSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
});

export const updateEpicSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
});

export const createStorySchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  storyPoints: z.number().min(0).max(100).optional(),
});

export const updateStorySchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  storyPoints: z.number().min(0).max(100).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  storyPoints: z.number().min(0).max(100).optional(),
  assignees: z.array(objectId).min(1, "At least one assignee required").optional(),
  dueDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  estimateHours: z.number().min(0).max(200).optional(),
  reviewer: objectId.optional(),
  notes: z.string().max(5000).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  storyPoints: z.number().min(0).max(100).optional(),
  assignees: z.array(objectId).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  estimateHours: z.number().min(0).max(200).optional(),
  reviewer: objectId.optional().nullable(),
  notes: z.string().max(5000).optional(),
});

export const createSubTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  storyPoints: z.number().min(0).max(100).optional(),
  assignee: objectId.optional(),
  dueDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
});

export const updateSubTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  storyPoints: z.number().min(0).max(100).optional(),
  assignee: objectId.optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
});

export type CreateEpicInput = z.infer<typeof createEpicSchema>;
export type UpdateEpicInput = z.infer<typeof updateEpicSchema>;
export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type UpdateStoryInput = z.infer<typeof updateStorySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateSubTaskInput = z.infer<typeof createSubTaskSchema>;
export type UpdateSubTaskInput = z.infer<typeof updateSubTaskSchema>;
