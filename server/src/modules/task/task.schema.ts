import { z } from "zod";
import { TaskStatus } from "../../generated/client.js";

export const createTaskSchema = z.object({
  sprintId: z.uuid().optional().describe('ID of the sprint the task belongs to'),
  phaseId: z.uuid().optional().describe('ID of the phase the task belongs to'),
  assigneeIds: z.array(z.uuid()).optional().default([]).describe('IDs of users assigned to the task'),
  title: z.string().min(1).describe('Title of the task'),
  description: z.string().optional().describe('Detailed description of the task'),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO).describe('Current status of the task'),
}).refine(data => data.sprintId || data.phaseId, {
  message: "Either sprintId or phaseId must be provided",
  path: ["sprintId", "phaseId"],
}).describe('Schema for creating a new task');

export const updateTaskSchema = z.object({
  assigneeIds: z.array(z.uuid()).optional().describe('IDs of users assigned to the task'),
  title: z.string().min(1).optional().describe('Updated title of the task'),
  description: z.string().optional().describe('Updated description of the task'),
  status: z.nativeEnum(TaskStatus).optional().describe('Updated status of the task'),
}).describe('Schema for updating task details');

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus).describe('New status for the task'),
  comment: z.string().optional().describe('Reason for the status change (required if status is BLOCKED)'),
}).refine((data) => {
  if (data.status === TaskStatus.BLOCKED && !data.comment) {
    return false;
  }
  return true;
}, {
  message: "Comment is required when status is BLOCKED",
  path: ["comment"],
}).describe('Schema for updating task status with conditional comment requirement');

const assigneeSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
}).describe('Assigned user details');

export const taskResponseSchema = z.object({
  id: z.uuid().describe('Unique identifier for the task'),
  sprintId: z.uuid().nullable().optional().describe('ID of the associated sprint'),
  phaseId: z.uuid().nullable().optional().describe('ID of the associated phase'),
  title: z.string().describe('Title of the task'),
  description: z.string().nullable().describe('Description of the task'),
  status: z.nativeEnum(TaskStatus).describe('Current status of the task'),
  createdAt: z.date().describe('Task creation timestamp'),
  updatedAt: z.date().describe('Last task update timestamp'),
  deletedAt: z.date().nullable().optional().describe('Timestamp when the task was soft deleted, or null if active'),
  assignees: z.array(assigneeSchema).describe('List of assigned users'),
  lastComment: z.object({
    id: z.uuid(),
    content: z.string(),
    authorId: z.uuid(),
    taskId: z.uuid(),
    deliverableId: z.uuid().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    author: z.object({
      id: z.uuid(),
      name: z.string(),
    }).optional(),
  }).nullable().optional().describe('Most recent comment on the task (block reason if status is BLOCKED)'),
}).describe('Response object containing task details');

export const taskQuerySchema = z.object({
  sprintId: z.uuid().optional().describe('Filter tasks by sprint ID'),
  phaseId: z.uuid().optional().describe('Filter tasks by phase ID'),
  assigneeId: z.uuid().optional().describe('Filter tasks by assignee ID'),
  status: z.nativeEnum(TaskStatus).optional().describe('Filter tasks by status'),
}).describe('Query parameters for listing tasks');

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
