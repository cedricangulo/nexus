import { AlertTriangle, Calendar, Target } from "lucide-react";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { CategoryBar } from "@/components/ui/category-bar";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Tracker } from "@/components/ui/tracker";
import { getSprints } from "@/lib/data/sprint";
import { getTasks } from "@/lib/data/tasks";
import { getAuthContext } from "@/lib/helpers/auth-token";
import {
  computeSprintHealth,
  findCurrentSprint,
} from "@/lib/helpers/dashboard-computations";
import type { Task } from "@/lib/types";
import { SprintHealthSkeleton } from "./skeletons";

function SprintHealthNormal({
  sprintHealth,
  sprintTasks,
}: {
  sprintHealth: Awaited<ReturnType<typeof computeSprintHealth>>;
  sprintTasks: Task[];
}) {
  const isOverdue = sprintHealth.daysRemaining < 0;
  const isNearEnd =
    sprintHealth.daysRemaining <= 3 && sprintHealth.daysRemaining >= 0;
  const hasBlockedTasks = sprintHealth.blockedTasks > 0;

  const trackerData = sprintTasks.map((task) => {
    let color = "bg-accent";
    if (task.status === "DONE") {
      color = "bg-chart-1";
    } else if (task.status === "IN_PROGRESS") {
      color = "bg-chart-3";
    } else if (task.status === "BLOCKED") {
      color = "bg-chart-4";
    }

    return {
      key: task.id,
      color,
      tooltip:
        task.title.length > 30 ? `${task.title.slice(0, 30)}...` : task.title,
    };
  });

  const getBadgeVariant = () => {
    if (isOverdue) {
      return "destructive" as const;
    }
    if (isNearEnd) {
      return "secondary" as const;
    }
    return "outline" as const;
  };

  const getBadgeText = (): string => {
    if (isOverdue) {
      return `${Math.abs(sprintHealth.daysRemaining)}d overdue`;
    }
    if (isNearEnd) {
      return `${sprintHealth.daysRemaining}d left`;
    }
    return `${sprintHealth.daysRemaining}d remaining`;
  };

  return (
    <Frame className="relative h-full transition-all">
      <FrameHeader className="flex-row items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-linear-120 from-primary to-primary/60 p-2 shadow-sm">
            <Target className="size-4 text-white" />
          </div>
          <div className="space-y-0">
            <FrameTitle className="text-sm">
              Sprint <span className="font-sora">{sprintHealth.number}</span>
            </FrameTitle>
            <FrameDescription className="line-clamp-1 text-xs">
              {sprintHealth.goal || "No goal set"}
            </FrameDescription>
          </div>
        </div>
        <Badge variant={getBadgeVariant()}>{getBadgeText()}</Badge>
      </FrameHeader>

      <FramePanel className="space-y-6">
        {hasBlockedTasks ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <AlertTriangle className="size-4 text-destructive" />
            <p className="text-sm">
              <span className="font-semibold text-destructive">
                {sprintHealth.blockedTasks} blocked task
                {sprintHealth.blockedTasks !== 1 ? "s" : ""}
              </span>{" "}
              <span className="text-muted-foreground">
                require immediate attention
              </span>
            </p>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Task Distribution</span>
            <span className="font-medium text-xs tabular-nums">
              {sprintHealth.totalTasks} total
            </span>
          </div>
          <Tracker className="h-4" data={trackerData} showTooltip />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sprint Progress</span>
            <span className="font-bold tabular-nums">
              {sprintHealth.completionPercentage}%
            </span>
          </div>
          <CategoryBar
            className="h-2"
            colors={[
              "status-success",
              "status-in-progress",
              "status-error",
              "status-info",
            ]}
            showLabels={false}
            values={[
              sprintHealth.doneTasks,
              sprintHealth.inProgressTasks,
              sprintHealth.blockedTasks,
              sprintHealth.todoTasks,
            ]}
          />
          <p className="font-sora text-muted-foreground text-xs">
            {sprintHealth.doneTasks + sprintHealth.inProgressTasks} /{" "}
            {sprintHealth.totalTasks}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Sprint Period</span>
          </div>
          <span className="font-medium text-xs">
            {new Date(sprintHealth.startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(sprintHealth.endDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </FramePanel>
    </Frame>
  );
}

function SprintHealthEmpty() {
  return (
    <Frame>
      <FramePanel>
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-sm">No active sprint</p>
        </div>
      </FramePanel>
    </Frame>
  );
}

function SprintHealthError() {
  return (
    <Frame>
      <FramePanel>
        <div className="py-12 text-center">
          <p className="font-semibold text-destructive text-sm">
            Unable to load sprint health
          </p>
          <p className="text-muted-foreground text-xs">
            The dashboard will update once the service is reachable again.
          </p>
        </div>
      </FramePanel>
    </Frame>
  );
}

export async function SprintHealthCard() {
  try {
    const { token } = await getAuthContext();
    const [sprints, tasks] = await Promise.all([
      getSprints(token, "teamLead"),
      getTasks(token),
    ]);

    const currentSprint = findCurrentSprint(sprints);

    if (!currentSprint) {
      return <SprintHealthEmpty />;
    }

    const sprintHealth = computeSprintHealth(currentSprint, tasks);
    const sprintTasks = tasks.filter(
      (task) => task.sprintId === currentSprint.id
    );

    return (
      <Suspense fallback={<SprintHealthSkeleton />}>
        <SprintHealthNormal
          sprintHealth={sprintHealth}
          sprintTasks={sprintTasks}
        />
      </Suspense>
    );
  } catch (_error) {
    return <SprintHealthError />;
  }
}
