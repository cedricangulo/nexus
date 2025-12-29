import { z } from "zod";

export const registerDeviceTokenSchema = z.object({
    token: z.string().min(1, "Token is required"),
    platform: z.enum(["web", "android", "ios"]),
});

export type RegisterDeviceTokenInput = z.infer<typeof registerDeviceTokenSchema>;
