import type { Phase, PhaseDetail, PhaseType } from "@/lib/types";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreatePhaseInput = {
  projectId?: string;
  type: PhaseType;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

export type UpdatePhaseInput = {
  type?: PhaseType;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

export type CreatePhaseTaskInput = {
  phaseId: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
  assigneeIds?: string[];
};

export const phaseApi = {
  listPhases: async (): Promise<Phase[]> => {
    const response = await apiClient.get(API_ENDPOINTS.PHASES.LIST);
    return response.data;
  },

  getPhaseById: async (id: string): Promise<PhaseDetail> => {
    const response = await apiClient.get(API_ENDPOINTS.PHASES.GET(id));
    return response.data;
  },

  /**
   * Alias for getPhaseById - kept for backward compatibility.
   * The backend now includes tasks, deliverables, and meetingLogs by default.
   */
  getPhaseWithDetails: async (id: string): Promise<PhaseDetail> =>
    phaseApi.getPhaseById(id),

  createPhase: async (data: CreatePhaseInput): Promise<Phase> => {
    const response = await apiClient.post(API_ENDPOINTS.PHASES.CREATE, data);
    return response.data;
  },

  createPhaseTask: async (data: CreatePhaseTaskInput): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.TASKS.CREATE, data);
  },

  updatePhase: async (id: string, data: UpdatePhaseInput): Promise<Phase> => {
    const response = await apiClient.put(API_ENDPOINTS.PHASES.UPDATE(id), data);
    return response.data;
  },

  deletePhase: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PHASES.DELETE(id));
  },
};
