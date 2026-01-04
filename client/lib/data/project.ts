import { cache } from "react";
import { projectApi } from "@/lib/api";
import { phaseApi } from "@/lib/api/phase";
import { requireUser } from "@/lib/helpers/rbac";
import type { PhaseDetail, Project } from "@/lib/types";

/**
 * Fetches the singleton project data
 * Wrapped in cache() to eliminate redundant API calls during a single render pass.
 * Used in Server Components for initial data loading
 * All authenticated roles can view
 */
export const getProject = cache(async (): Promise<Project | null> => {
  try {
    await requireUser();
    const response = await projectApi.getProject();
    return response;
  } catch (error: unknown) {
    // Project not found (404) is expected when team lead hasn't created it yet
    const axiosError = error as { response?: { status: number } };
    if (axiosError?.response?.status === 404) {
      return null;
    }
    console.error("Failed to fetch project:", error);
    return null;
  }
});

/**
 * Fetch all project phases with their deliverables
 * Wrapped in cache() to eliminate redundant API calls during a single render pass.
 * Used in Server Components for comprehensive project overview
 * All authenticated roles can view
 */
export const getProjectPhases = cache(
  async (): Promise<PhaseDetail[] | null> => {
    try {
      await requireUser();
      const phases = await phaseApi.listPhases();

      // Fetch detailed information for each phase in parallel
      const detailedPhases = await Promise.all(
        phases.map((phase) => phaseApi.getPhaseById(phase.id))
      );

      return detailedPhases;
    } catch (error) {
      console.error("Failed to fetch project phases:", error);
      return null;
    }
  }
);
