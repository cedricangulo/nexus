/**
 * Team Users Data Fetching - Cache Components Compatible
 */

import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getApiClient } from "@/lib/api/server-client";
import type { User } from "@/lib/types/models";

/**
 * Fetches all team members for management purposes
 * Used in Server Components for team management UI
 * Team Lead only - per US-022
 *
 * Accessed only by team-lead components; layout already validates role.
 * API layer still enforces authorization on the server.
 *
 * Use `getAllUsersForDisplay()` if you need user list for display purposes (all roles)
 */
export async function getTeamUsers(token: string): Promise<User[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("users");

  try {
    const api = await getApiClient(token);
    const response = await api.get<User[]>(API_ENDPOINTS.USERS.LIST);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch team users:", error);
    return [];
  }
}

/**
 * Fetches all users for display purposes only (showing names in cards, assignments, etc.)
 * Used in Server Components when any role needs to see user information
 * All authenticated roles: TEAM_LEAD, MEMBER, ADVISER
 *
 * Use cases:
 * - Displaying assigned users in task/deliverable cards
 * - Showing user names in phase detail views
 * - Avatar displays and user references
 *
 * This is separate from `getTeamUsers()` which is for management purposes only
 */
export async function getAllUsersForDisplay(token: string): Promise<User[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("users");

  try {
    const api = await getApiClient(token);
    const response = await api.get<User[]>(API_ENDPOINTS.USERS.LIST);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch users for display:", error);
    return [];
  }
}
