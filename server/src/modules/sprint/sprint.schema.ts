import { z } from "zod";

export const createSprintSchema = z.object({
  projectId: z.uuid().optional().describe('ID of the project the sprint belongs to'),
  number: z.number().int().positive().optional().describe('Sprint number (auto-incremented if not provided)'),
  goal: z.string().optional().describe('Goal or objective of the sprint'),
  startDate: z.string().datetime().describe('Sprint start date in ISO 8601 format'),
  endDate: z.string().datetime().describe('Sprint end date in ISO 8601 format'),
}).describe('Schema for creating a new sprint');

export const updateSprintSchema = createSprintSchema.partial().describe('Schema for updating an existing sprint (partial update)');

export const sprintResponseSchema = z.object({
  id: z.uuid().describe('Unique identifier for the sprint'),
  projectId: z.uuid().describe('ID of the associated project'),
  number: z.number().int().describe('Sequential number of the sprint'),
  goal: z.string().nullable().describe('Goal of the sprint'),
  startDate: z.date().describe('Sprint start date'),
  endDate: z.date().describe('Sprint end date'),
  createdAt: z.date().describe('Sprint creation timestamp'),
  updatedAt: z.date().describe('Last sprint update timestamp'),
  deletedAt: z.date().nullable().optional().describe('Timestamp when the sprint was soft deleted, or null if active'),
  _count: z.object({
    tasks: z.number(),
  }).optional().describe('Count of related tasks'),
}).describe('Response object containing sprint details');

export const sprintProgressSchema = z.object({
  totalTasks: z.number().int().describe('Total number of tasks in the sprint'),
  completedTasks: z.number().int().describe('Number of completed tasks in the sprint'),
  percentage: z.number().describe('Percentage of tasks completed'),
}).describe('Object representing the progress of a sprint');

export type CreateSprintInput = z.infer<typeof createSprintSchema>;
export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;
