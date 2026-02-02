import { User } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { StatusBreakdownBar } from "@/components/ui/status-breakdown-bar";
import type {
  ActivityLog,
  Task,
  UserContribution,
  User as UserType,
} from "@/lib/types";
import { ActivityTrendMiniChart } from "./activity-trend-mini-chart";

interface ContributionCardProps {
  user: UserType;
  contribution: UserContribution;
  tasks: Task[];
  activityLogs: ActivityLog[];
}

export async function ContributionCard({
  user,
  contribution,
  tasks,
  activityLogs,
}: ContributionCardProps) {
  "use cache";
  cacheLife("minutes");
  cacheTag("users", "tasks", "deliverables", "activity-logs");

  // Calculate completion rate
  const completionRate =
    contribution.assignedTasksCount > 0
      ? Math.round(
          (contribution.completedTasksCount / contribution.assignedTasksCount) *
            100
        )
      : 0;

  // Count tasks by status for this user
  const userTasks = tasks.filter((task) =>
    task.assignees?.some((assignee) => assignee.id === user.id)
  );

  const tasksDone = userTasks.filter(
    (t) => t.status === "DONE" && !t.deletedAt
  ).length;
  const tasksInProgress = userTasks.filter(
    (t) => t.status === "IN_PROGRESS" && !t.deletedAt
  ).length;
  const tasksBlocked = userTasks.filter(
    (t) => t.status === "BLOCKED" && !t.deletedAt
  ).length;
  const tasksTodo = userTasks.filter(
    (t) => t.status === "TODO" && !t.deletedAt
  ).length;

  // Handle adviser role differently
  if (user.role === "ADVISER") {
    return null;
  }

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <User aria-hidden="true" className="size-4 text-muted-foreground" />
        <div className="flex flex-col">
          <FrameTitle className="text-sm">{user.name}</FrameTitle>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </div>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
          {user.role}
        </span>
      </FrameHeader>
      <FramePanel>
        <div className="space-y-4">
          {/* Top row: Circular progress + Activity trend chart */}
          <div className="flex items-center gap-4">
            <ProgressCircle
              progress={completionRate}
              size={45}
              strokeWidth={6}
            />
            <div className="flex-1">
              <ActivityTrendMiniChart activityLogs={activityLogs} />
            </div>
          </div>

          {/* Task status breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium font-sora text-muted-foreground text-xs">
                {contribution.assignedTasksCount} Tasks
              </h4>
            </div>
            {contribution.assignedTasksCount > 0 ? (
              <StatusBreakdownBar
                blocks={[
                  {
                    label: "Done",
                    count: tasksDone,
                    color: "bg-chart-1",
                  },
                  {
                    label: "In Progress",
                    count: tasksInProgress,
                    color: "bg-chart-2",
                  },
                  {
                    label: "Blocked",
                    count: tasksBlocked,
                    color: "bg-chart-3",
                  },
                  {
                    label: "To Do",
                    count: tasksTodo,
                    color: "bg-muted",
                  },
                ]}
              />
            ) : (
              <p className="text-muted-foreground text-xs">No tasks assigned</p>
            )}
          </div>

          {/* Other contributions grid */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-center">
            <div>
              <p className="font-bold font-sora text-2xl tabular-nums">
                {contribution.uploadedEvidenceCount}
              </p>
              <p className="text-muted-foreground text-xs">Evidence</p>
            </div>
            <div>
              <p className="font-bold font-sora text-2xl tabular-nums">
                {contribution.commentsCount}
              </p>
              <p className="text-muted-foreground text-xs">Comments</p>
            </div>
          </div>
        </div>
      </FramePanel>
    </Frame>
  );
}
