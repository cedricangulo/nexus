import { cache } from "react";
import { phaseApi } from "@/lib/api";
import { requireUser } from "@/lib/helpers/rbac";
import type { Phase, PhaseDetail } from "@/lib/types";

/**
 * Fetches all phases with basic information
 * Wrapped in cache() to eliminate redundant API calls during a single render pass.
 * All authenticated roles can view
 */
export const getPhases = cache(async (): Promise<Phase[]> => {
  try {
    await requireUser();
    const response = await phaseApi.listPhases();
    return response;
  } catch (error) {
    console.error("Failed to fetch phases:", error);
    return [];
  }
});

/**
 * Fetches all phases with detailed information including deliverables
 * Wrapped in cache() to eliminate redundant API calls during a single render pass.
 * Uses Promise.all for parallel fetching
 * All authenticated roles can view
 */
export const getPhasesWithDetails = cache(async (): Promise<PhaseDetail[]> => {
  try {
    await requireUser();
    const phases = await phaseApi.listPhases();

    const phasesWithDetails = await Promise.all(
      phases.map(async (phase: Phase) => {
        try {
          const detailResponse = await phaseApi.getPhaseById(phase.id);
          return detailResponse;
        } catch (error) {
          console.error(
            `Failed to fetch details for phase ${phase.id}:`,
            error
          );
          return null;
        }
      })
    );

    return phasesWithDetails.filter(
      (phase: PhaseDetail | null): phase is PhaseDetail => phase !== null
    );
  } catch (error) {
    console.error("Failed to fetch phases with details:", error);
    return [];
  }
});

/**
 * Fetches a single phase by ID with details
 * Wrapped in cache() to eliminate redundant API calls during a single render pass.
 * All authenticated roles can view
 */
export const getPhaseById = cache(
  async (id: string): Promise<PhaseDetail | null> => {
    try {
      await requireUser();
      const response = await phaseApi.getPhaseById(id);
      return response;
    } catch (error) {
      console.error(`Failed to fetch phase ${id}:`, error);
      return null;
    }
  }
);
