import { getPrismaClient } from "../../utils/database.js";
import logger from "../../utils/logger.js";

const prisma = getPrismaClient();

interface RegisterTokenInput {
    userId: string;
    token: string;
    platform: string;
}

export async function registerDeviceToken(input: RegisterTokenInput) {
    // Upsert: if token exists, update userId (in case user re-logs on same device)
    return prisma.deviceToken.upsert({
        where: { token: input.token },
        update: {
            userId: input.userId,
            platform: input.platform,
        },
        create: input,
    });
}

export async function unregisterDeviceToken(token: string, userId: string) {
    const deviceToken = await prisma.deviceToken.findUnique({
        where: { token },
    });

    if (!deviceToken) {
        logger.warn({ token }, "Device token not found for unregister");
        return null;
    }

    // Only allow user to unregister their own tokens
    if (deviceToken.userId !== userId) {
        throw new Error("Unauthorized: Cannot unregister another user's device token");
    }

    return prisma.deviceToken.delete({
        where: { token },
    });
}

export async function getDeviceTokensByUserId(userId: string) {
    return prisma.deviceToken.findMany({
        where: { userId },
    });
}

export async function deleteAllUserDeviceTokens(userId: string) {
    return prisma.deviceToken.deleteMany({
        where: { userId },
    });
}

export async function deleteTokensByValues(tokens: string[]) {
    if (tokens.length === 0) return { count: 0 };

    return prisma.deviceToken.deleteMany({
        where: { token: { in: tokens } },
    });
}
