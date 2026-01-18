/**
 * Task Data Fetching Layer - Cache Components Compatible
 *
 * Server-side data fetching for tasks with Cache Components support
 * Uses "use cache" directive for instant caching
 */

import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getApiClient } from "@/lib/api/server-client";
import type { Task } from "@/lib/types";

/**
 * Fetch all tasks
 *
 * @param token - Authentication token for the request
 * @returns Array of all tasks
 */
export async function getTasks(token: string): Promise<Task[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("tasks");

  try {
    const api = await getApiClient(token);
    const response = await api.get<Task[]>(API_ENDPOINTS.TASKS.LIST);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return [];
  }
}

/**
 * Fetch a single task by ID
 *
 * @param id - Task ID
 * @param token - Authentication token for the request
 * @returns Task or null if not found
 */
export async function getTaskById(
  id: string,
  token: string
): Promise<Task | null> {
  "use cache";
  cacheLife("weeks");
  cacheTag("tasks", `task-${id}`);

  try {
    const api = await getApiClient(token);
    const response = await api.get<Task>(API_ENDPOINTS.TASKS.GET(id));
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch task ${id}:`, error);
    return null;
  }
}
