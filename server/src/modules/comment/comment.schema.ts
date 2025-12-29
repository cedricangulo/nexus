import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1).describe('Content of the comment'),
  taskId: z.uuid().optional().describe('ID of the task to comment on (mutually exclusive with deliverableId)'),
  deliverableId: z.uuid().optional().describe('ID of the deliverable to comment on (mutually exclusive with taskId)'),
}).refine((data) => {
  return (data.taskId && !data.deliverableId) || (!data.taskId && data.deliverableId);
}, {
  message: "Must provide either taskId or deliverableId, but not both",
  path: ["taskId", "deliverableId"],
}).describe('Schema for creating a new comment');

export const updateCommentSchema = z.object({
  content: z.string().min(1).describe('Updated content of the comment'),
}).describe('Schema for updating an existing comment');

export const commentResponseSchema = z.object({
  id: z.uuid().describe('Unique identifier for the comment'),
  content: z.string().describe('Content of the comment'),
  authorId: z.uuid().describe('ID of the user who created the comment'),
  taskId: z.uuid().nullable().describe('ID of the associated task (if any)'),
  deliverableId: z.uuid().nullable().describe('ID of the associated deliverable (if any)'),
  createdAt: z.date().describe('Comment creation timestamp'),
  updatedAt: z.date().describe('Last comment update timestamp'),
  author: z.object({
    id: z.uuid(),
    name: z.string(),
		role: z.enum(["MEMBER", "TEAM_LEAD", "ADVISER"]).optional(),
  }).optional().describe('Author details'),
}).describe('Response object containing comment details');

export const commentQuerySchema = z.object({
  taskId: z.uuid().optional().describe('Filter comments by task ID'),
  deliverableId: z.uuid().optional().describe('Filter comments by deliverable ID'),
}).refine((data) => {
  return (data.taskId && !data.deliverableId) || (!data.taskId && data.deliverableId);
}, {
  message: "Must provide either taskId or deliverableId",
  path: ["taskId", "deliverableId"],
}).describe('Query parameters for listing comments (requires either taskId or deliverableId)');

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CommentQuery = z.infer<typeof commentQuerySchema>;
