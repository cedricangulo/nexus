import type { Notification } from "@/lib/types";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreateNotificationInput = {
  userId: string;
  message: string;
  link?: string;
};

export const notificationApi = {
  listNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    return response.data;
  },

  createNotification: async (
    data: CreateNotificationInput
  ): Promise<Notification> => {
    const response = await apiClient.post(
      API_ENDPOINTS.NOTIFICATIONS.CREATE,
      data
    );
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
  },
};
