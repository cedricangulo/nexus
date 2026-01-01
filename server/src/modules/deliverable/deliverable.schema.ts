import { z } from "zod";
import { DeliverableStatus, DeliverableStage } from "../../generated/client.js";

export const createDeliverableSchema = z.object({
  phaseId: z.uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  stage: z.nativeEnum(DeliverableStage).optional(),
});

export const updateDeliverableSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(DeliverableStatus).optional(),
  stage: z.nativeEnum(DeliverableStage).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const deliverableResponseSchema = z.object({
  id: z.string(),
  phaseId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(DeliverableStatus),
  stage: z.nativeEnum(DeliverableStage),
  dueDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  _count: z.object({
    evidence: z.number(),
    comments: z.number(),
  }).optional().describe('Count of related entities'),
});

export const deliverableQuerySchema = z.object({
  phaseId: z.uuid().optional(),
});

export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>;
export type UpdateDeliverableInput = z.infer<typeof updateDeliverableSchema>;
export type DeliverableQuery = z.infer<typeof deliverableQuerySchema>;
