import type { MeetingLog } from "@/lib/types";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const meetingLogApi = {
  uploadMeetingLog: async (input: {
    title: string;
    date: string;
    file: File;
    sprintId?: string;
    phaseId?: string;
  }): Promise<MeetingLog> => {
    const formData = new FormData();
    if (input.sprintId) {
      formData.append("sprintId", input.sprintId);
    }
    if (input.phaseId) {
      formData.append("phaseId", input.phaseId);
    }
    formData.append("title", input.title);
    formData.append("date", input.date);
    formData.append("file", input.file);

    const response = await apiClient.post(
      API_ENDPOINTS.MEETING_LOGS.CREATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 300_000, // 5 minutes for large file uploads to Cloudinary
      }
    );
    return response.data;
  },

  getMeetingLogsBySprint: async (sprintId: string): Promise<MeetingLog[]> => {
    const response = await apiClient.get(
      API_ENDPOINTS.MEETING_LOGS.BY_SPRINT(sprintId)
    );
    return response.data;
  },

  getMeetingLogsByPhase: async (phaseId: string): Promise<MeetingLog[]> => {
    const response = await apiClient.get(
      API_ENDPOINTS.MEETING_LOGS.BY_PHASE(phaseId)
    );
    return response.data;
  },

  deleteMeetingLog: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.MEETING_LOGS.DELETE(id));
  },
};
