import axios from "axios";
import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getApiClient } from "@/lib/api/server-client";
import type { Sprint, SprintProgress, Task } from "@/lib/types";

export async function getSprints(
  token: string,
  role: string
): Promise<Sprint[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("sprints");

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

export async function getSprintProgress(
  id: string,
  token: string
): Promise<SprintProgress | undefined> {
  "use cache";
  cacheLife("weeks");
  cacheTag("sprints", `sprint-${id}`);

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

export async function getSprintsProgress(
  ids: string[],
  token: string
): Promise<Record<string, SprintProgress | undefined>> {
  const progressEntries = await Promise.all(
    ids.map(async (id) => {
      const progress = await getSprintProgress(id, token);
      return [id, progress] as const;
    })
  );

  return Object.fromEntries(progressEntries);
}

export async function getSprintById(
  id: string,
  token: string
): Promise<Sprint | null> {
  "use cache";
  cacheLife("weeks");
  cacheTag("sprints", `sprint-${id}`);

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

export async function getSprintTasks(
  sprintId: string,
  token: string
): Promise<Task[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("sprints", `sprint-${sprintId}`, "tasks");

  try {
    const api = await getApiClient(token);
    const response = await api.get<Task[]>(API_ENDPOINTS.TASKS.LIST, {
      params: { sprintId },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch tasks for sprint ${sprintId}:`, error);
    return [];
  }
}
