import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { createAuthHeaders, serverClient } from "@/lib/api/server-client";
import type { Sprint, SprintProgress, Task } from "@/lib/types";

export async function getSprints(
  token: string,
  role: string
): Promise<Sprint[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("sprints");

  try {
    // Members see only their assigned sprints
    const endpoint =
      role === "member"
        ? API_ENDPOINTS.SPRINTS.LIST_MINE
        : API_ENDPOINTS.SPRINTS.LIST;

    const response = await serverClient.get<Sprint[]>(endpoint, {
      headers: createAuthHeaders(token),
    });
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
    const response = await serverClient.get<SprintProgress>(
      API_ENDPOINTS.SPRINTS.PROGRESS(id),
      { headers: createAuthHeaders(token) }
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
    const response = await serverClient.get<Sprint>(
      API_ENDPOINTS.SPRINTS.GET(id),
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
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
    const response = await serverClient.get<Task[]>(API_ENDPOINTS.TASKS.LIST, {
      params: { sprintId },
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch tasks for sprint ${sprintId}:`, error);
    return [];
  }
}
