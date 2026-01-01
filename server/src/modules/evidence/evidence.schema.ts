import { z } from "zod";

export const createEvidenceSchema = z.object({
  deliverableId: z.uuid(),
});

export const evidenceResponseSchema = z.object({
  id: z.string(),
  deliverableId: z.string(),
  uploaderId: z.string(),
  fileUrl: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  createdAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});
