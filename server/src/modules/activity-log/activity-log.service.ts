import { getPrismaClient } from "../../utils/database.js";
import { Prisma } from "../../generated/client.js";
import logger from "../../utils/logger.js";

const prisma = getPrismaClient();

export interface CreateActivityLogInput {
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: string;
}

export async function createActivityLog(input: CreateActivityLogInput) {
    if (!input.userId) {
        logger.warn({
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId,
        }, 'Activity log skipped: missing userId');
        return null;
    }

    try {
        logger.debug({
            userId: input.userId,
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId,
        }, 'Attempting to create activity log');

        const result = await prisma.activityLog.create({
            data: {
                ...input,
                userId: input.userId,
            },
        });

        logger.debug({ activityLogId: result.id }, 'Activity log created successfully');
        return result;
    } catch (error) {
        logger.error({
            error,
            userId: input.userId,
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId,
        }, 'Error creating activity log');

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            logger.error({
                code: error.code,
                message: error.message,
                meta: error.meta,
            }, 'Prisma error details');

            if (error.code === "P2003") {
                logger.warn('Foreign key constraint violation - userId may not exist in User table');
            }
        }

        return null;
    }
}

export async function getAllActivityLogs() {
    return prisma.activityLog.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getActivityLogsByEntity(entityType: string, entityId: string) {
    return prisma.activityLog.findMany({
        where: {
            entityType,
            entityId,
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getActivityLogsByUser(userId: string) {
    return prisma.activityLog.findMany({
        where: {
            userId,
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
