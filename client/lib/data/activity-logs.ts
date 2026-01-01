/**
 * Activity Logs Data Fetching Layer
 *
 * Server-side data fetching for activity logs
 * Handles fetching and sorting of activity log entries
 */

import "server-only";

import { activityLogApi } from "@/lib/api/activity-log";
import { requireTeamLead } from "@/lib/helpers/rbac";
import type { ActivityLog } from "@/lib/types";

/**
 * Fetch all activity logs sorted by most recent first
 *
 * @returns Array of activity logs sorted by creation date (newest first)
 * @throws Error if data fetching fails
 */
export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    await requireTeamLead();
    const activities = await activityLogApi.listActivityLogs();

    // Sort by most recent first
    return activities.sort(
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
 * @returns Array of activity logs for the entity, sorted newest first
 * @throws Error if data fetching fails
 */
export async function getActivityLogsByEntity(
  entityType: string,
  entityId: string
): Promise<ActivityLog[]> {
  try {
    await requireTeamLead();
    const activities = await activityLogApi.getActivityLogsByEntity(
      entityType,
      entityId
    );

    // Sort by most recent first
    return activities.sort(
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
