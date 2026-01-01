import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { registerDeviceTokenHandler, unregisterDeviceTokenHandler } from "./device-token.controller.js";
import { registerDeviceTokenSchema } from "./device-token.schema.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";

export async function deviceTokenRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    // Register device token (all authenticated users)
    server.post<{ Body: { token: string; platform: string } }>(
        "/",
        {
            preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
            schema: {
                body: registerDeviceTokenSchema,
                response: {
                    201: z.object({
                        success: z.literal(true),
                        data: z.object({
                            id: z.uuid(),
                        }),
                    }),
                },
            },
        },
        registerDeviceTokenHandler
    );

    // Unregister device token (for logout)
    server.delete<{ Params: { token: string } }>(
        "/:token",
        {
            preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
            schema: {
                params: z.object({
                    token: z.string().min(1),
                }),
                response: {
                    200: z.object({
                        success: z.literal(true),
                        message: z.string(),
                    }),
                },
            },
        },
        unregisterDeviceTokenHandler
    );
}
