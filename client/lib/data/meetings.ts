/**
 * Meeting Data Fetching Layer - Cache Components Compatible
 *
 * Uses "Pass-Through Authentication" pattern:
 * 1. Page extracts token (dynamic boundary)
 * 2. Token passed as string to cached function
 * 3. Clean serverClient makes API call with manual auth header
 *
 * Server-side data fetching for meeting logs
 * Aggregates meeting data from sprints and phases
 */

import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { createAuthHeaders, serverClient } from "@/lib/api/server-client";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";

export type MeetingsPageData = {
  logs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
  totalExpected: number;
};

/**
 * Fetch all meeting logs and calculate metrics
 * Token must be passed from dynamic page layer
 *
 * Aggregates meeting logs from all sprints and phases
 * totalExpected is the number of sprints (since meetings are linked to sprints)
 *
 * @returns Object containing logs and totalExpected count
 * @throws Error if data fetching fails
 */
export async function getMeetingsData(
  token: string
): Promise<MeetingsPageData> {
  "use cache";
  cacheLife("weeks");
  cacheTag("meetings", "sprints", "phases");

  try {
    const authHeaders = createAuthHeaders(token);

    // Fetch sprints and phases in parallel
    const [sprintsResponse, phasesResponse] = await Promise.all([
      serverClient.get<Sprint[]>(API_ENDPOINTS.SPRINTS.LIST, {
        headers: authHeaders,
      }),
      serverClient.get<Phase[]>(API_ENDPOINTS.PHASES.LIST, {
        headers: authHeaders,
      }),
    ]);

    const sprints = sprintsResponse.data;
    const phases = phasesResponse.data;

    // Collect all meeting logs from sprints and phases in parallel
    const allLogsPromises = await Promise.all([
      ...sprints.map((sprint) =>
        serverClient
          .get<MeetingLog[]>(API_ENDPOINTS.MEETING_LOGS.BY_SPRINT(sprint.id), {
            headers: authHeaders,
          })
          .then((res) => res.data)
          .catch(() => [])
      ),
      ...phases.map((phase) =>
        serverClient
          .get<MeetingLog[]>(API_ENDPOINTS.MEETING_LOGS.BY_PHASE(phase.id), {
            headers: authHeaders,
          })
          .then((res) => res.data)
          .catch(() => [])
      ),
    ]);

    const logs = allLogsPromises.flat();
    const totalExpected = sprints.length;

    return {
      logs,
      sprints,
      phases,
      totalExpected,
    };
  } catch (error) {
    console.error("Failed to fetch meetings data:", error);
    return {
      logs: [],
      sprints: [],
      phases: [],
      totalExpected: 0,
    };
  }
}
