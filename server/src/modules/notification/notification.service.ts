import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { sendPushToUser } from "../../services/push.service.js";
import logger from "../../utils/logger.js";

const prisma = getPrismaClient();

interface CreateNotificationInput {
  userId: string;
  message: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: input,
  });

  // Send push notification (fire and forget - don't block response)
  sendPushToUser(input.userId, {
    title: "Nexus",
    body: input.message,
    link: input.link,
  }).catch((err) => {
    logger.warn({ err, userId: input.userId }, "Push notification failed");
  });

  return notification;
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new NotFoundError("Notification", id);
  }

  if (notification.userId !== userId) {
    throw new Error("Unauthorized access to notification");
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function deleteNotification(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new NotFoundError("Notification", id);
  }

  if (notification.userId !== userId) {
    throw new Error("Unauthorized access to notification");
  }

  return prisma.notification.delete({
    where: { id },
  });
}
