import axios from "axios";
import { cache } from "react";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getApiClient } from "@/lib/api/server-client";
import { requireUser } from "@/lib/helpers/rbac";
import { getSprintStatus } from "@/lib/helpers/sprint";
import type { Sprint, SprintProgress, Task } from "@/lib/types";
import type { sprintParsers } from "@/lib/types/search-params";

type SprintFilters = {
  [K in keyof typeof sprintParsers]: ReturnType<
    (typeof sprintParsers)[K]["parseServerSide"]
  >;
};

export const getSprints = cache(
  async (token: string, role: string): Promise<Sprint[]> => {
    try {
      const api = await getApiClient(token);
      // Members see only their assigned sprints
      const endpoint =
        role === "MEMBER"
          ? API_ENDPOINTS.SPRINTS.LIST_MINE
          : API_ENDPOINTS.SPRINTS.LIST;

      const response = await api.get<Sprint[]>(endpoint);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch sprints:", error);
      return [];
    }
  }
);

export const getSprintProgress = cache(
  async (id: string, token: string): Promise<SprintProgress | undefined> => {
    try {
      const api = await getApiClient(token);
      const response = await api.get<SprintProgress>(
        API_ENDPOINTS.SPRINTS.PROGRESS(id)
      );
      return response.data;
    } catch {
      return;
    }
  }
);

export const getSprintsProgress = cache(
  async (
    ids: string[],
    token: string
  ): Promise<Record<string, SprintProgress | undefined>> => {
    const progressEntries = await Promise.all(
      ids.map(async (id) => {
        const progress = await getSprintProgress(id, token);
        return [id, progress] as const;
      })
    );

    return Object.fromEntries(progressEntries);
  }
);

export const getSprintById = cache(
  async (id: string, token: string): Promise<Sprint | null> => {
    try {
      const api = await getApiClient(token);
      const response = await api.get<Sprint>(API_ENDPOINTS.SPRINTS.GET(id));
      return response.data;
    } catch (error) {
      // Re-throw 403 Forbidden errors to be handled at page level
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        throw error;
      }
      console.error(`Failed to fetch sprint ${id}:`, error);
      return null;
    }
  }
);

export const getSprintMetadata = cache(
  async (sprintId: string, token: string): 
  Promise<{
    id: string;
    projectId: string;
    number: number;
    goal?: string | null | undefined;
    startDate: string;
    endDate: string;
  } | null> => {
    try {
      const api = await getApiClient(token);
      const response = await api.get<Sprint>(
        API_ENDPOINTS.SPRINTS.GET(sprintId)
      );
      return {
        id: response.data.id,
        projectId: response.data.projectId,
        number: response.data.number,
        goal: response.data.goal,
        startDate: response.data.startDate,
        endDate: response.data.endDate,
      };
    } catch (error) {
      console.error(`Failed to fetch metadata for sprint ${sprintId}:`, error);
      return null;
    }
  }
);

export const getSprintTasks = cache(
  async (sprintId: string, token: string): Promise<Task[]> => {
    try {
      const api = await getApiClient(token);
      const response = await api.get<Task[]>(API_ENDPOINTS.TASKS.LIST, {
        params: { sprintId },
      });
      
      // Server-side filtering for members: only show assigned tasks
      const user = await requireUser();
      const tasks = response.data;
      
      if (user.role === "member") {
        return tasks.filter((task) =>
          task.assignees?.some((assignee) => assignee.id === user.id)
        );
      }
      
      // Team leads and advisers see all tasks
      return tasks;
    } catch (error) {
      console.error(`Failed to fetch tasks for sprint ${sprintId}:`, error);
      return [];
    }
  }
);

export const getFilteredSprints = cache(
  async (
    token: string,
    role: string,
    filters: SprintFilters
  ): Promise<Sprint[]> => {

    const allSprints = await getSprints(token, role);

    const now = new Date();

    let filtered = allSprints;

    if (filters.status !== "ALL") {
      filtered = filtered.filter((sprint) => {
        const status = getSprintStatus(sprint, now);
        return status === filters.status;
      });
    }

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter((sprint) => {
        const numberMatch = sprint.number.toString().includes(query);
        const goalMatch = sprint.goal?.toLowerCase().includes(query) ?? false;
        return numberMatch || goalMatch;
      });
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(
        (sprint) => new Date(sprint.startDate) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(
        (sprint) => new Date(sprint.endDate) <= endDate
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }
);
