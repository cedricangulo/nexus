import type { Evidence } from "@/lib/types";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const evidenceApi = {
  uploadEvidence: async (
    deliverableId: string,
    file: File
  ): Promise<Evidence> => {
    const formData = new FormData();
    formData.append("deliverableId", deliverableId);
    formData.append("file", file);

    const response = await apiClient.post(
      API_ENDPOINTS.EVIDENCE.CREATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300_000, // 5 minutes for large file uploads to Cloudinary
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Evidence upload progress: ${percentCompleted}%`);
          }
        },
      }
    );
    return response.data;
  },

  getEvidenceByDeliverable: async (
    deliverableId: string
  ): Promise<Evidence[]> => {
    const response = await apiClient.get(
      API_ENDPOINTS.EVIDENCE.BY_DELIVERABLE(deliverableId)
    );
    return response.data;
  },

  deleteEvidence: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.EVIDENCE.DELETE(id));
  },

  restoreEvidence: async (id: string): Promise<Evidence> => {
    const response = await apiClient.post(API_ENDPOINTS.EVIDENCE.RESTORE(id));
    return response.data;
  },
};
