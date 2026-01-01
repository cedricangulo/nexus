/**
 * Activity Logs
 * Server component that fetches and displays recent activity logs
 */

import { formatDistanceToNow } from "date-fns";
import { Clock, Logs } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getActivityLogs } from "@/lib/data/activity-logs";
import { formatTitleCase } from "@/lib/helpers/format-title-case";
import type { ActivityLog } from "@/lib/types";

const ACTION_LABELS: Record<string, string> = {
  DELIVERABLE_APPROVED: "Approved",
  DELIVERABLE_REJECTED: "Changes Requested",
  EVIDENCE_UPLOADED: "Evidence Uploaded",
  TASK_BLOCKED: "Task Blocked",
  TASK_COMPLETED: "Task Completed",
  COMMENT_ADDED: "Comment Added",
};

const DEFAULT_LABEL = "Activity";

type ActivityLogsDisplayProps = {
  activities: ActivityLog[];
  limit?: number;
};

function ActivityLogsDisplay({
  activities,
  limit = 5,
}: ActivityLogsDisplayProps) {
  const displayedActivities = activities.slice(0, limit);

  if (displayedActivities.length === 0) {
    return (
      <Frame>
        <FrameHeader className="flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-linear-120 from-info to-info/80 p-2 shadow-sm">
              <Logs className="size-4 text-white" />
            </div>
            <FrameTitle className="text-sm">Activity Logs</FrameTitle>
          </div>
        </FrameHeader>
        <FramePanel>
          <EmptyState
            description="Activity will appear here as team members work"
            icon={Clock}
            title="No recent activity"
          />
        </FramePanel>
      </Frame>
    );
  }

  return (
    <Frame>
      <FrameHeader className="flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-linear-120 from-blue-500 to-blue-400 p-2 shadow-sm dark:from-blue-800 dark:to-blue-700">
            <Logs className="size-4 text-white" />
          </div>
          <FrameTitle className="text-sm">Activity Logs</FrameTitle>
        </div>
        <Button asChild variant="outline">
          <Link href="/settings/activity-logs">View All</Link>
        </Button>
      </FrameHeader>
      <FramePanel>
        {displayedActivities.map((activity) => {
          const label = ACTION_LABELS[activity.action] ?? DEFAULT_LABEL;
          const actionLabel = formatTitleCase(activity.action);

          return (
            <div
              className="flex items-center justify-between gap-4 py-2"
              key={activity.id}
            >
              <p className="font-medium text-sm leading-tight *:text-muted-foreground *:text-xs">
                {actionLabel}{" "}
                {activity.user ? <span>by {activity.user.name}</span> : null}
                <span>
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </p>
              <Badge className="shrink-0 text-[10px]" variant="outline">
                {label}
              </Badge>
            </div>
          );
        })}
      </FramePanel>
    </Frame>
  );
}

export async function ActivityLogs() {
  const activities = await getActivityLogs();

  return <ActivityLogsDisplay activities={activities} limit={5} />;
}
