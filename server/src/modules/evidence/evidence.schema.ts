import { z } from "zod";

// For file uploads (multipart)
export const createEvidenceSchema = z.object({
  deliverableId: z.uuid(),
});

// For link submissions (JSON body)
export const createLinkEvidenceSchema = z.object({
  deliverableId: z.uuid(),
  link: z.string().url("Must be a valid URL"),
  fileName: z.string().optional(), // Optional display name for the link
});

export type CreateLinkEvidenceInput = z.infer<typeof createLinkEvidenceSchema>;

export const evidenceResponseSchema = z.object({
  id: z.string(),
  deliverableId: z.string(),
  uploaderId: z.string(),
  type: z.enum(["FILE", "LINK"]),
  fileUrl: z.string(),
  fileName: z.string().nullable().optional(),
  fileType: z.string().nullable().optional(),
  createdAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});
