/**
 * Notifications Data Fetching
 *
 * Server-only function to fetch the current user's notifications.
 * Provides secure, paginated access to notifications with proper error handling.
 *
 * @module lib/data/notifications
 */

import "server-only";

import { cache } from "react";
import { notificationApi } from "@/lib/api/notification";
import type { Notification } from "@/lib/types";
import { requireUser } from "../helpers/rbac";

/**
 * Fetch all notifications for the current user
 *
 * Uses React cache() to deduplicate multiple calls within the same request.
 * This ensures NotificationBadge and NotificationContent only trigger one DB query.
 *
 * Retrieves notifications ordered by creation date (newest first).
 * Only authenticated users can fetch their own notifications.
 *
 * @returns Array of notifications for current user
 */
export const getNotifications = cache(async (): Promise<Notification[]> => {
  try {
    // Ensure user is authenticated
    await requireUser();

    // Fetch from API
    const notifications = await notificationApi.listNotifications();

    // Sort by createdAt DESC (newest first)
    return notifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    // Graceful degradation: return empty array to prevent dashboard crash
    return [];
  }
});

/**
 * Fetch unread notification count for current user
 *
 * Used for badge display on notification icon.
 *
 * @returns Number of unread notifications
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    await requireUser();
    const notifications = await notificationApi.listNotifications();
    return notifications.filter((n) => !n.isRead).length;
  } catch (error) {
    console.error("Failed to fetch unread count:", error);
    return 0;
  }
}
