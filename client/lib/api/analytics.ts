import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

// Define types locally for now or import if they exist
export type DashboardOverview = {
  projectProgress: number;
  activeSprint?: {
    id: string;
    name: string;
    progress: number;
  };
  pendingTasksCount: number;
  upcomingDeadlines: unknown[];
};

export type PhaseAnalytics = {
  id: string;
  name: string;
  progress: number;
  deliverablesCompleted: number;
  totalDeliverables: number;
};

export type SprintAnalytics = {
  id: string;
  number: number;
  completionRate: number;
  velocity: number;
};

export type TeamContribution = {
  userId: string;
  userName: string;
  tasksCompleted: number;
  commits?: number;
};

export type TimelineData = {
  phases: unknown[];
  sprints: unknown[];
  milestones: unknown[];
};

export const analyticsApi = {
  getDashboardOverview: async (): Promise<DashboardOverview> => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.OVERVIEW);
    return response.data;
  },

  getPhaseAnalytics: async (): Promise<PhaseAnalytics[]> => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.PHASES);
    return response.data;
  },

  getSprintAnalytics: async (): Promise<SprintAnalytics[]> => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.SPRINTS);
    return response.data;
  },

  getTeamContributions: async (): Promise<TeamContribution[]> => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.CONTRIBUTIONS);
    return response.data;
  },

  getTimelineData: async (): Promise<TimelineData> => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYTICS.TIMELINE);
    return response.data;
  },
};
