/**
 * Meeting Data Fetching Layer
 *
 * Server-side data fetching for meeting logs
 * Aggregates meeting data from sprints and phases
 */

import { cache } from "react";
import { meetingLogApi } from "@/lib/api/meeting-log";
import { phaseApi } from "@/lib/api/phase";
import { sprintApi } from "@/lib/api/sprint";
import { requireUser } from "@/lib/helpers/rbac";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";

export type MeetingsPageData = {
  logs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
  totalExpected: number;
};

/**
 * Fetch all meeting logs and calculate metrics
 * Wrapped in cache() to eliminate redundant API calls during a single render pass.
 *
 * Aggregates meeting logs from all sprints and phases
 * totalExpected is the number of sprints (since meetings are linked to sprints)
 * All authenticated roles can view
 *
 * @returns Object containing logs and totalExpected count
 * @throws Error if data fetching fails
 */
export const getMeetingsData = cache(async (): Promise<MeetingsPageData> => {
  try {
    await requireUser();
    const [sprints, phases] = await Promise.all([
      sprintApi.listSprints(),
      phaseApi.listPhases(),
    ]);

    // Collect all meeting logs from sprints and phases in parallel
    const allLogs = await Promise.all([
      ...sprints.map((sprint) =>
        meetingLogApi.getMeetingLogsBySprint(sprint.id).catch(() => [])
      ),
      ...phases.map((phase) =>
        meetingLogApi.getMeetingLogsByPhase(phase.id).catch(() => [])
      ),
    ]);

    const logs = allLogs.flat();
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
});
