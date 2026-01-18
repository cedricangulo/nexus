import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getApiClient } from "@/lib/api/server-client";
import type { PhaseDetail, Project } from "@/lib/types";

export async function getProject(token: string): Promise<Project | null> {
  "use cache";
  cacheLife("weeks");
  cacheTag("project");

  try {
    const api = await getApiClient(token);
    const response = await api.get<Project>(API_ENDPOINTS.PROJECT.GET);
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
    const api = await getApiClient(token);
    const phasesResponse = await api.get<{ id: string }[]>(
      API_ENDPOINTS.PHASES.LIST
    );

    const detailedPhases = await Promise.all(
      phasesResponse.data.map(async (phase) => {
        const response = await api.get<PhaseDetail>(
          API_ENDPOINTS.PHASES.GET(phase.id)
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
