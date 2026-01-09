/**
 * Notification Server Actions
 *
 * Handles mutations for notification state changes (mark as read, mark all as read).
 * Follows the validation → authorization → API call → revalidation pattern.
 *
 * @module actions/notifications
 */

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { notificationApi } from "@/lib/api/notification";
import { requireUser } from "@/lib/helpers/rbac";
import type { Notification } from "@/lib/types";

/**
 * Schema for marking a single notification as read
 */
const MarkAsReadSchema = z.object({
  id: z.uuid("Invalid notification ID"),
});

/**
 * Mark a single notification as read
 *
 * Validation → Authorization → API Call → Revalidation
 *
 * @param id - Notification ID to mark as read
 * @returns Success/error response with updated notification
 */
export async function markAsReadAction(
  id: string
): Promise<{ success: boolean; error?: string; notification?: Notification }> {
  // 1. Authorization - require authenticated user
  try {
    await requireUser();
  } catch {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  // 2. Input Validation
  const validatedId = MarkAsReadSchema.safeParse({ id });

  if (!validatedId.success) {
    return {
      success: false,
      error: "Invalid notification ID",
    };
  }

  try {
    // 3. API Call
    await notificationApi.markAsRead(validatedId.data.id);

    // 4. Revalidation - Clear ISR cache
    revalidatePath("/", "layout");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return {
      success: false,
      error: "Failed to update notification. Please try again.",
    };
  }
}

/**
 * Mark all notifications as read for the current user
 *
 * Validation → Authorization → API Call → Revalidation
 *
 * @returns Success/error response
 */
export async function markAllAsReadAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  // 1. Authorization - require authenticated user
  try {
    await requireUser();
  } catch {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    // 2. API Call
    await notificationApi.markAllAsRead();

    // 3. Revalidation - Clear ISR cache
    revalidatePath("/", "layout");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return {
      success: false,
      error: "Failed to update notifications. Please try again.",
    };
  }
}
