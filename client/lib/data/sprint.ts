import "server-only";

import { auth } from "@/auth";
import { sprintApi } from "@/lib/api/sprint";
import type { Sprint, SprintProgress } from "@/lib/types";

/**
 * Get sprints based on user role
 *
 * - MEMBER: Only sprints where user has assigned tasks
 * - TEAM_LEAD/ADVISER: All sprints (full read-only visibility)
 *
 * This centralizes authorization logic and prevents members from
 * accessing unauthorized sprint data via the frontend.
 */
export async function getSprints(): Promise<Sprint[]> {
  const session = await auth();

  if (!session?.user) {
    return [];
  }

  const role = session.user.role;

  try {
    // Members see only their assigned sprints
    if (role === "member") {
      return await sprintApi.listMySprints();
    }

    // Team Lead and Adviser see all sprints
    return await sprintApi.listSprints();
  } catch (error) {
    console.error("Failed to fetch sprints:", error);
    return [];
  }
}

/**
 * Get sprint progress with role-based access control
 */
export async function getSprintProgress(
  id: string
): Promise<SprintProgress | undefined> {
  const session = await auth();

  if (!session?.user) {
    return;
  }

  try {
    return await sprintApi.getSprintProgress(id);
  } catch {
    return;
  }
}

/**
 * Get multiple sprint progress records
 */
export async function getSprintsProgress(
  ids: string[]
): Promise<Record<string, SprintProgress | undefined>> {
  const progressEntries = await Promise.all(
    ids.map(async (id) => {
      const progress = await getSprintProgress(id);
      return [id, progress] as const;
    })
  );

  return Object.fromEntries(progressEntries);
}
