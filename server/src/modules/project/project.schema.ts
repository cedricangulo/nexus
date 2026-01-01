import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").describe('Name of the project'),
  description: z.string().optional().describe('Brief description of the project'),
  repositoryUrl: z.string().url().optional().describe('URL to the source code repository'),
  startDate: z.string().datetime().describe('Project start date in ISO 8601 format'),
  endDate: z.string().datetime().optional().describe('Expected project end date in ISO 8601 format'),
}).describe('Schema for creating a new project');

export const updateProjectSchema = createProjectSchema.partial().describe('Schema for updating an existing project (partial update)');

export const projectResponseSchema = z.object({
  id: z.uuid().describe('Unique identifier for the project'),
  name: z.string().describe('Name of the project'),
  description: z.string().nullable().describe('Brief description of the project'),
  repositoryUrl: z.string().nullable().describe('URL to the source code repository'),
  startDate: z.date().describe('Project start date'),
  endDate: z.date().nullable().describe('Project end date'),
  createdAt: z.date().describe('Project creation timestamp'),
  updatedAt: z.date().describe('Last project update timestamp'),
}).describe('Response object containing project details');

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
