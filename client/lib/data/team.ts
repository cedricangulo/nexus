import { cache } from "react";
import { userApi } from "@/lib/api";
import { requireUser } from "@/lib/helpers/rbac";
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
export const getTeamUsers = cache(async (): Promise<User[]> => {
  try {
    const users = await userApi.listUsers();
    return users;
  } catch (error) {
    console.error("Failed to fetch team users:", error);
    return [];
  }
});

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
export const getAllUsersForDisplay = cache(async (): Promise<User[]> => {
  try {
    await requireUser(); // All authenticated users allowed
    const users = await userApi.listUsers();
    return users;
  } catch (error) {
    console.error("Failed to fetch users for display:", error);
    return [];
  }
});
