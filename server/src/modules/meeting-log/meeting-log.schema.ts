import { z } from "zod";

export const createMeetingLogSchema = z.object({
  sprintId: z.uuid().optional(),
  phaseId: z.uuid().optional(),
  title: z.string().min(1),
  date: z.string().datetime(),
}).refine(data => data.sprintId || data.phaseId, {
  message: "Either sprintId or phaseId must be provided",
  path: ["sprintId", "phaseId"],
});

export const meetingLogResponseSchema = z.object({
  id: z.string(),
  sprintId: z.string().nullable().optional(),
  phaseId: z.string().nullable().optional(),
  title: z.string(),
  date: z.coerce.date(),
  fileUrl: z.string(),
  uploaderId: z.string(),
  uploader: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
  }).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
