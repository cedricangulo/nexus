"use server";

import type { UpdateProjectInput } from "@/lib/api/project";
import { projectApi } from "@/lib/api/project";
import { getProject } from "@/lib/data/project";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { requireTeamLead } from "@/lib/helpers/rbac";
import type { Project } from "@/lib/types";

/**
 * Update or create project configuration
 * Team Lead only - requires role-based access control
 * If project doesn't exist, creates one instead of patching
 */
export async function updateProjectAction(
  data: UpdateProjectInput
): Promise<Project | null> {
  try {
    await requireTeamLead();

    const { token } = await getAuthContext();

    // Check if project exists
    const existingProject = await getProject(token);

    // If no project exists, create one
    if (!existingProject) {
      return await projectApi.createProject({
        name: data.name || "Untitled Project",
        description: data.description,
        repositoryUrl: data.repositoryUrl,
        startDate: data.startDate || new Date().toISOString().split("T")[0],
        endDate: data.endDate,
      });
    }

    // Otherwise update existing project
    return await projectApi.patchProject(data);
  } catch (error) {
    console.error("Failed to update project:", error);
    return null;
  }
}
