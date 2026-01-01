/**
 * Team Members Data Fetching
 *
 * Server-only function to fetch team members for mention functionality.
 * Returns users formatted for the DiceUI Mention component.
 *
 * Per USER_STORIES.md requirements:
 * - Team Lead: ✅ Can use @mentions
 * - Team Member: ❌ Cannot use @mentions (per original requirements)
 * - Adviser: ✅ Can use @mentions
 *
 * Related functions:
 * - `getAllUsersForDisplay()` in team.ts: For display purposes (all roles)
 * - `getTeamUsers()` in team.ts: For management purposes (team lead only)
 * - `getTeamMembersForMentions()`: For mentions functionality (team lead + adviser)
 *
 * @module lib/data/team-members
 */
"use server";

import { getAllUsersForDisplay } from "@/lib/data/team";
import { getCurrentUser } from "@/lib/data/user";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";

/**
 * Fetch all team members formatted for mention dropdown
 *
 * Returns users in format expected by DiceUI Mention component:
 * - id: User UUID
 * - label: User's full name (displayed in dropdown)
 * - value: User's email (for unique identification)
 *
 * Security: Only Team Leads and Advisers can fetch user list per requirements.
 * Members receive empty array per USER_STORIES.md specification.
 *
 * @returns Array of users formatted for mentions
 */
export async function getTeamMembersForMentions(): Promise<
  Array<{ id: string; label: string; value: string }>
> {
  try {
    // Check if user is authenticated and authorized
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.warn("No authenticated user for team members fetch");
      return [];
    }

    // Per USER_STORIES.md: Only Team Leads and Advisers can use mentions
    // Members cannot use @mention functionality
    if (
      currentUser.role !== UserRole.TEAM_LEAD &&
      currentUser.role !== UserRole.ADVISER
    ) {
      return [];
    }

    const users: User[] = await getAllUsersForDisplay();

    return users.map((user) => ({
      id: user.id,
      label: user.name,
      value: user.email,
    }));
  } catch (error) {
    // Log error but don't crash - return empty array for graceful degradation
    console.error("Failed to fetch team members:", error);
    return [];
  }
}
