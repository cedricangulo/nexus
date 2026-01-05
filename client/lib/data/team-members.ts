/**
 * Team Members Data Fetching - Cache Components Compatible
 *
 * Server-only function to fetch team members for mention functionality.
 * Returns users formatted for the DiceUI Mention component.
 */

import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { createAuthHeaders, serverClient } from "@/lib/api/server-client";
import type { User } from "@/lib/types";
import { UserRole } from "@/lib/types";

export async function getTeamMembersForMentions(
  token: string,
  currentUserRole?: string
): Promise<Array<{ id: string; label: string; value: string }>> {
  "use cache";
  cacheLife("weeks");
  cacheTag("users");

  try {
    // Per USER_STORIES.md: Only Team Leads and Advisers can use mentions
    if (
      currentUserRole &&
      currentUserRole !== UserRole.TEAM_LEAD &&
      currentUserRole !== UserRole.ADVISER
    ) {
      return [];
    }

    const response = await serverClient.get<User[]>(API_ENDPOINTS.USERS.LIST, {
      headers: createAuthHeaders(token),
    });

    return response.data.map((user) => ({
      id: user.id,
      label: user.name,
      value: user.email,
    }));
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return [];
  }
}
