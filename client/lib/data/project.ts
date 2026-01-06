import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { createAuthHeaders, serverClient } from "@/lib/api/server-client";
import type { PhaseDetail, Project } from "@/lib/types";

export async function getProject(token: string): Promise<Project | null> {
  "use cache";
  cacheLife("weeks");
  cacheTag("project");

  try {
    const response = await serverClient.get<Project>(
      API_ENDPOINTS.PROJECT.GET,
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { status: number } };
    if (axiosError?.response?.status === 404) {
      return null;
    }
    console.error("Failed to fetch project:", error);
    return null;
  }
}

export async function getProjectPhases(
  token: string
): Promise<PhaseDetail[] | null> {
  "use cache";
  cacheLife("weeks");
  cacheTag("phases", "project");

  try {
    const phasesResponse = await serverClient.get<{ id: string }[]>(
      API_ENDPOINTS.PHASES.LIST,
      { headers: createAuthHeaders(token) }
    );

    const detailedPhases = await Promise.all(
      phasesResponse.data.map(async (phase) => {
        const response = await serverClient.get<PhaseDetail>(
          API_ENDPOINTS.PHASES.GET(phase.id),
          { headers: createAuthHeaders(token) }
        );
        return response.data;
      })
    );

    return detailedPhases;
  } catch (error) {
    console.error("Failed to fetch project phases:", error);
    return null;
  }
}
