import type { Sprint, SprintProgress } from "@/lib/types";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreateSprintInput = {
  projectId?: string;
  goal: string;
  startDate: string;
  endDate: string;
};

export type UpdateSprintInput = {
  goal?: string;
  startDate?: string;
  endDate?: string;
};

export const sprintApi = {
  listSprints: async (): Promise<Sprint[]> => {
    const response = await apiClient.get(API_ENDPOINTS.SPRINTS.LIST);
    return response.data;
  },

  listMySprints: async (): Promise<Sprint[]> => {
    const response = await apiClient.get(API_ENDPOINTS.SPRINTS.LIST_MINE);
    return response.data;
  },

  getSprintById: async (id: string): Promise<Sprint> => {
    const response = await apiClient.get(API_ENDPOINTS.SPRINTS.GET(id));
    return response.data;
  },

  createSprint: async (data: CreateSprintInput): Promise<Sprint> => {
    const response = await apiClient.post(API_ENDPOINTS.SPRINTS.CREATE, data);
    return response.data;
  },

  updateSprint: async (
    id: string,
    data: UpdateSprintInput
  ): Promise<Sprint> => {
    const response = await apiClient.put(API_ENDPOINTS.SPRINTS.UPDATE(id), data);
    return response.data;
  },

  deleteSprint: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.SPRINTS.DELETE(id));
  },

  restoreSprint: async (id: string): Promise<Sprint> => {
    const response = await apiClient.post(API_ENDPOINTS.SPRINTS.RESTORE(id));
    return response.data;
  },

  getSprintProgress: async (id: string): Promise<SprintProgress> => {
    const response = await apiClient.get(API_ENDPOINTS.SPRINTS.PROGRESS(id));
    return response.data;
  },
};
