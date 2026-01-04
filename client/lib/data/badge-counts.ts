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
import { meetingLogApi } from "@/lib/api/meeting-log";
import { phaseApi } from "@/lib/api/phase";
import { taskApi } from "@/lib/api/task";
import { requireUser } from "@/lib/helpers/rbac";
import { DeliverableStatus, TaskStatus, type User } from "@/lib/types";

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
 * - Phases missing MeetingLog entries in the last 7 days (documentation gaps)
 *
 * For TEAM_LEAD: Shows all counts
 * For MEMBER: Shows only counts for items assigned to the member
 *
 * @param user - The current user (used to filter counts for members)
 * @returns Object containing all badge counts
 */
export const getBadgeCounts = cache(
  async (user?: User | null): Promise<BadgeCounts> => {
    await requireUser();

    try {
      const [deliverables, tasks, phases, activityLogs] = await Promise.all([
        deliverableApi.listDeliverables().catch((error) => {
          if (error.status === 403) {
            return [];
          }
          console.error("Error fetching deliverables:", error);
          return [];
        }),
        taskApi.listTasks().catch((error) => {
          if (error.status === 403) {
            return [];
          }
          console.error("Error fetching tasks:", error);
          return [];
        }),
        phaseApi.listPhases().catch((error) => {
          if (error.status === 403) {
            return [];
          }
          console.error("Error fetching phases:", error);
          return [];
        }),
        activityLogApi.listActivityLogs().catch((error) => {
          if (error.status === 403) {
            return [];
          }
          console.error("Error fetching activity logs:", error);
          return [];
        }),
      ]);

      // For TEAM_LEAD: show all counts; for MEMBER: show only assigned items
      const isMember = user?.role === "MEMBER";
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

      // Check for phases missing meeting logs in the last 7 days
      // For members: only check phases they're involved in (have deliverables in)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const phasesToCheck = isMember
        ? phases.filter((phase) =>
            deliverables.some((d) => d.phaseId === phase.id)
          )
        : phases;

      const phaseChecks = await Promise.all(
        phasesToCheck.map(async (phase) => {
          try {
            const logs = await meetingLogApi.getMeetingLogsByPhase(phase.id);
            const recentLogs = logs.filter(
              (log) => new Date(log.date) >= oneWeekAgo
            );
            return recentLogs.length === 0;
          } catch {
            // Consider it missing if we can't fetch logs
            return true;
          }
        })
      );

      const phasesWithoutMeetings = phaseChecks.filter(Boolean).length;

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
