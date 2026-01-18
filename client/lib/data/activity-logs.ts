/**
 * Activity Logs Data Fetching Layer
 *
 * Server-side data fetching for activity logs with Cache Components support
 * Handles fetching and sorting of activity log entries using "use cache" directive
 */

import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getApiClient } from "@/lib/api/server-client";
import type { ActivityLog } from "@/lib/types";

/**
 * Fetch all activity logs sorted by most recent first
 *
 * @param token - Authentication token for the request
 * @returns Array of activity logs sorted by creation date (newest first)
 */
export async function getActivityLogs(token: string): Promise<ActivityLog[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("activity-logs");

  try {
    const api = await getApiClient(token);
    const response = await api.get<ActivityLog[]>(
      API_ENDPOINTS.ACTIVITY_LOGS.LIST
    );

    // Sort by most recent first
    return response.data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return [];
  }
}

/**
 * Fetch activity logs for a specific entity
 *
 * @param entityType - Type of entity (e.g., 'deliverable', 'task')
 * @param entityId - ID of the entity
 * @param token - Authentication token for the request
 * @returns Array of activity logs for the entity, sorted newest first
 */
export async function getActivityLogsByEntity(
  entityType: string,
  entityId: string,
  token: string
): Promise<ActivityLog[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("activity-logs", `entity-${entityType}-${entityId}`);

  try {
    const api = await getApiClient(token);
    const response = await api.get<ActivityLog[]>(
      API_ENDPOINTS.ACTIVITY_LOGS.BY_ENTITY(entityType, entityId)
    );

    // Sort by most recent first
    return response.data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error(
      `Failed to fetch activity logs for ${entityType} ${entityId}:`,
      error
    );
    return [];
  }
}
