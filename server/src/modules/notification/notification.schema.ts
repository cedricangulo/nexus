import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.uuid(),
  message: z.string().min(1),
  link: z.string().optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

export const notificationResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  message: z.string(),
  link: z.string().nullable(),
  isRead: z.boolean(),
  createdAt: z.date(),
});
