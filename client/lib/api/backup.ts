import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const backupApi = {
  exportData: async (): Promise<Blob> => {
    const response = await apiClient.get(API_ENDPOINTS.BACKUP.EXPORT, {
      responseType: "blob",
    });
    return response.data;
  },

  getFilesBackupUrl: async (): Promise<{ url: string }> => {
    const response = await apiClient.get(API_ENDPOINTS.BACKUP.FILES);
    return response.data;
  },
};
