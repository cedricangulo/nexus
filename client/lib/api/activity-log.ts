import type { ActivityLog } from "@/lib/types";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const activityLogApi = {
  listActivityLogs: async (): Promise<ActivityLog[]> => {
    const response = await apiClient.get(API_ENDPOINTS.ACTIVITY_LOGS.LIST);
    return response.data;
  },

  getMyActivityLogs: async (): Promise<ActivityLog[]> => {
    const response = await apiClient.get(API_ENDPOINTS.ACTIVITY_LOGS.ME);
    return response.data;
  },

  getActivityLogsByEntity: async (
    entityType: string,
    entityId: string
  ): Promise<ActivityLog[]> => {
    const response = await apiClient.get(
      API_ENDPOINTS.ACTIVITY_LOGS.BY_ENTITY(entityType, entityId)
    );
    return response.data;
  },
};
