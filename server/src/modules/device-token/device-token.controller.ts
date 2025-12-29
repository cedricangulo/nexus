import { FastifyReply, FastifyRequest } from "fastify";
import { registerDeviceToken, unregisterDeviceToken } from "./device-token.service.js";
import logger from "../../utils/logger.js";

export async function registerDeviceTokenHandler(
    request: FastifyRequest<{ Body: { token: string; platform: string } }>,
    reply: FastifyReply
) {
    const userId = request.user.id;
    const { token, platform } = request.body;

    try {
        const deviceToken = await registerDeviceToken({ userId, token, platform });
        logger.info({ userId, platform }, "Device token registered");
        return reply.status(201).send({
            success: true,
            data: { id: deviceToken.id },
        });
    } catch (error) {
        logger.error({ error, userId }, "Failed to register device token");
        return reply.status(500).send({
            success: false,
            error: "Failed to register device token",
        });
    }
}

export async function unregisterDeviceTokenHandler(
    request: FastifyRequest<{ Params: { token: string } }>,
    reply: FastifyReply
) {
    const userId = request.user.id;
    const { token } = request.params;

    try {
        await unregisterDeviceToken(token, userId);
        logger.info({ userId }, "Device token unregistered");
        return reply.status(200).send({
            success: true,
            message: "Device token unregistered",
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return reply.status(403).send({
                success: false,
                error: error.message,
            });
        }
        logger.error({ error, userId }, "Failed to unregister device token");
        return reply.status(500).send({
            success: false,
            error: "Failed to unregister device token",
        });
    }
}
