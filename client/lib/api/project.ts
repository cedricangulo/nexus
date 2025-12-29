import type { Project } from "@/lib/types";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreateProjectInput = {
  name: string;
  description?: string;
  repositoryUrl?: string;
  startDate: string;
  endDate?: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string;
  repositoryUrl?: string;
  startDate?: string;
  endDate?: string;
};

export const projectApi = {
  getProject: async (): Promise<Project> => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECT.GET);
    return response.data;
  },

  createProject: async (data: CreateProjectInput): Promise<Project> => {
    const response = await apiClient.post(API_ENDPOINTS.PROJECT.CREATE, data);
    return response.data;
  },

  updateProject: async (data: UpdateProjectInput): Promise<Project> => {
    const response = await apiClient.put(API_ENDPOINTS.PROJECT.UPDATE, data);
    return response.data;
  },

  patchProject: async (data: Partial<UpdateProjectInput>): Promise<Project> => {
    const response = await apiClient.patch(API_ENDPOINTS.PROJECT.PATCH, data);
    return response.data;
  },
};
