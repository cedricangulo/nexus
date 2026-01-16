/**
 * Badge Counts Data Fetching Layer
 *
 * Server-side data fetching for actionable sidebar badges
 * Provides counts for items requiring Team Lead attention
 */

import "server-only";

import { cache } from "react";
import { activityLogApi } from "@/lib/api/activity-log";
import { deliverableApi } from "@/lib/api/deliverable";
import { sprintApi } from "@/lib/api/sprint";
import { taskApi } from "@/lib/api/task";
import { requireUser } from "@/lib/helpers/rbac";
import { DeliverableStatus, TaskStatus } from "@/lib/types";
import { getMeetingsData } from "./meetings";

export type BadgeCounts = {
  deliverablesInReview: number;
  blockedTasks: number;
  phasesWithoutMeetings: number;
  todayActivityCount: number;
};

/**
 * Get all actionable badge counts for the sidebar
 *
 * Fetches counts for:
 * - Deliverables in REVIEW status (pending Team Lead review)
 * - Tasks with BLOCKED status (team members needing help)
 * - Sprints/Phases missing MeetingLog entries (documentation gaps)
 *
 * For TEAM_LEAD: Shows all counts
 * For MEMBER: Shows only counts for items assigned to the member
 *
 * @param _token - Auth token (reserved for future API header usage)
 * @returns Object containing all badge counts
 */
export const getBadgeCounts = cache(
  async (_token: string): Promise<BadgeCounts> => {
    const user = await requireUser();

    try {
      const [deliverables, tasks, activityLogs, meetingsData, sprints] =
        await Promise.all([
          deliverableApi.listDeliverables().catch(() => []),
          taskApi.listTasks().catch(() => []),
          activityLogApi.listActivityLogs().catch(() => []),
          getMeetingsData(_token).catch(() => ({
            logs: [],
            sprints: [],
            phases: [],
            totalExpected: 0,
          })),
          sprintApi.listSprints().catch(() => []),
        ]);

      // For TEAM_LEAD: show all counts; for MEMBER: show only assigned items
      const isMember = user?.role === "member";
      const userId = user?.id;

      // Count deliverables in REVIEW status (not deleted)
      // For members: only count if they're in the team working on this deliverable
      // Since deliverables don't have direct assignees field, we'll show all for now
      // but team leads should only see their own in a real implementation
      const deliverablesInReview = deliverables.filter(
        (d) => d.status === DeliverableStatus.REVIEW && !d.deletedAt
      ).length;

      // Count tasks with BLOCKED status (not deleted)
      // For members: only count tasks assigned to them
      const blockedTasks = tasks.filter((t) => {
        if (t.status !== TaskStatus.BLOCKED || t.deletedAt) {
          return false;
        }
        // If member: only count if user is assigned to this task
        if (isMember) {
          return t.assignees?.some((assignee) => assignee.id === userId);
        }
        return true;
      }).length;

      // Count sprints/phases without ANY meetings (same logic as summary cards)
      const { logs, phases } = meetingsData;

      // Valid sprints: not deleted and have start/end dates
      const validSprints = sprints.filter(
        (s) => !s.deletedAt && s.startDate && s.endDate
      );

      // Valid phases: have start/end dates
      const validPhases = phases.filter((p) => p.startDate && p.endDate);

      // Find which have meetings
      const sprintsWithMeetings = new Set(
        logs.map((log) => log.sprintId).filter(Boolean)
      );
      const phasesWithMeetings = new Set(
        logs.map((log) => log.phaseId).filter(Boolean)
      );

      // Count missing (sprints + phases without meetings)
      const missingSprintsCount = validSprints.filter(
        (s) => !sprintsWithMeetings.has(s.id)
      ).length;
      const missingPhasesCount = validPhases.filter(
        (p) => !phasesWithMeetings.has(p.id)
      ).length;

      const phasesWithoutMeetings = missingSprintsCount + missingPhasesCount;

      // Count today's activity logs
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const todayActivityCount = activityLogs.filter(
        (log) => new Date(log.createdAt) >= today
      ).length;

      return {
        deliverablesInReview,
        blockedTasks,
        phasesWithoutMeetings,
        todayActivityCount,
      };
    } catch (error) {
      console.error("Failed to fetch badge counts:", error);
      return {
        deliverablesInReview: 0,
        blockedTasks: 0,
        phasesWithoutMeetings: 0,
        todayActivityCount: 0,
      };
    }
  }
);
