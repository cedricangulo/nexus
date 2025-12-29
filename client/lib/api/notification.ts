import type { Notification } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreateNotificationInput = {
  userId: string;
  message: string;
  link?: string;
};

export const notificationApi = {
  listNotifications: async (): Promise<Notification[]> => {
    try {
      const client = await createApiClient();
      const response = await client.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
      return response.data;
    } catch (error) {
      console.error(
        "Notification API error:",
        error instanceof Error ? error.message : error
      );
      // Return empty array on error to prevent crashes
      return [];
    }
  },

  createNotification: async (
    data: CreateNotificationInput
  ): Promise<Notification> => {
    const client = await createApiClient();
    const response = await client.post(
      API_ENDPOINTS.NOTIFICATIONS.CREATE,
      data
    );
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    const client = await createApiClient();
    await client.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  markAllAsRead: async (): Promise<void> => {
    const client = await createApiClient();
    await client.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  deleteNotification: async (id: string): Promise<void> => {
    const client = await createApiClient();
    await client.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
  },
};
