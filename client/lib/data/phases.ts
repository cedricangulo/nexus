/**
 * Phase Data Fetching Layer - Cache Components Compatible
 *
 * Uses "Pass-Through Authentication" pattern:
 * 1. Page extracts token (dynamic boundary)
 * 2. Token passed as string to cached function
 * 3. Clean serverClient makes API call with manual auth header
 *
 * This prevents the "Dynamic data sources inside cache scope" error.
 */

import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { createAuthHeaders, serverClient } from "@/lib/api/server-client";
import type { Phase, PhaseDetail } from "@/lib/types";

/**
 * Fetches all phases with basic information
 * Token must be passed from dynamic page layer
 */
export async function getPhases(token: string): Promise<Phase[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("phases");

  try {
    const response = await serverClient.get<Phase[]>(
      API_ENDPOINTS.PHASES.LIST,
      {
        headers: createAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch phases:", error);
    return [];
  }
}

/**
 * Fetches all phases with detailed information including deliverables
 * Token must be passed from dynamic page layer
 * Uses Promise.all for parallel fetching
 */
export async function getPhasesWithDetails(
  token: string
): Promise<PhaseDetail[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("phases", "deliverables");

  try {
    const phasesResponse = await serverClient.get<Phase[]>(
      API_ENDPOINTS.PHASES.LIST,
      {
        headers: createAuthHeaders(token),
      }
    );
    const phases = phasesResponse.data;

    const phasesWithDetails = await Promise.all(
      phases.map(async (phase: Phase) => {
        try {
          const detailResponse = await serverClient.get<PhaseDetail>(
            API_ENDPOINTS.PHASES.GET(phase.id),
            {
              headers: createAuthHeaders(token),
            }
          );
          return detailResponse.data;
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
}

/**
 * Fetches a single phase by ID with details
 * Token must be passed from dynamic page layer
 */
export async function getPhaseById(
  id: string,
  token: string
): Promise<PhaseDetail | null> {
  "use cache";
  cacheLife("weeks");
  cacheTag("phases", `phase-${id}`, "deliverables");

  try {
    const response = await serverClient.get<PhaseDetail>(
      API_ENDPOINTS.PHASES.GET(id),
      {
        headers: createAuthHeaders(token),
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch phase ${id}:`, error);
    return null;
  }
}
