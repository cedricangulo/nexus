import { z } from "zod";
import { Role } from "../../generated/client.js";

export const updateUserSchema = z.object({
  name: z.string().min(1).optional().describe('User\'s full name'),
  role: z.nativeEnum(Role).optional().describe('User\'s role (Team Lead only)'), 
}).describe('Schema for updating user profile');

export const userResponseSchema = z.object({
  id: z.uuid().describe('Unique identifier for the user'),
  email: z.string().email().describe('User\'s email address'),
  name: z.string().describe('User\'s full name'),
  role: z.nativeEnum(Role).describe('User\'s role in the project'),
  createdAt: z.date().describe('Account creation timestamp'),
  updatedAt: z.date().describe('Last profile update timestamp'),
  deletedAt: z.date().nullable().optional().describe('Timestamp when the user was soft deleted, or null if active'),
}).describe('Response object containing user details');

export const userContributionSchema = z.object({
  assignedTasksCount: z.number().describe('Total number of tasks assigned to the user'),
  completedTasksCount: z.number().describe('Total number of tasks completed by the user'),
  uploadedEvidenceCount: z.number().describe('Total number of evidence files uploaded by the user'),
  commentsCount: z.number().describe('Total number of comments posted by the user'),
}).describe('Summary of user contributions to the project');

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
