import { TrendingDown, TrendingUp } from "lucide-react";
import { Suspense } from "react";
import { FramePanel } from "@/components/ui/frame";
import { Tracker } from "@/components/ui/tracker";
import { getDeliverables } from "@/lib/data/deliverables";
import { getPhases } from "@/lib/data/phases";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { computeProjectCompletion } from "@/lib/helpers/dashboard-computations";
import { formatMonthDay } from "@/lib/helpers/format-date";
import { cn } from "@/lib/utils";
import { ProjectHealthSkeleton } from "./skeletons";

const targetPercentage = 70;

function ProjectHealthNormal({
  completion,
}: {
  completion: Awaited<ReturnType<typeof computeProjectCompletion>>;
}) {
  const trend = completion.isOnTrack ? "up" : "down";
  let statusText = "In Progress";
  if (completion.isOnTrack) {
    statusText = "On Track";
  } else if (targetPercentage) {
    statusText = "Behind Target";
  }

  const trackerData = [
    ...Array.from({ length: completion.completedDeliverables }, (_, i) => ({
      key: `completed-${i}`,
      color: "bg-chart-1",
      tooltip: "Completed",
    })),
    ...Array.from({ length: completion.inProgressDeliverables }, (_, i) => ({
      key: `progress-${i}`,
      color: "bg-chart-2",
      tooltip: "In Progress",
    })),
    ...Array.from({ length: completion.reviewDeliverables }, (_, i) => ({
      key: `review-${i}`,
      color: "bg-chart-3",
      tooltip: "In Review",
    })),
    ...Array.from(
      {
        length: Math.max(
          0,
          completion.totalDeliverables -
            completion.completedDeliverables -
            completion.inProgressDeliverables -
            completion.reviewDeliverables
        ),
      },
      (_, i) => ({
        key: `pending-${i}`,
        color: "bg-accent",
        tooltip: "Not Started",
      })
    ),
  ];

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-end gap-2">
          <div className="font-bold font-sora text-5xl tabular-nums">
            {completion.overallPercentage}
            <span className="text-3xl text-muted-foreground">%</span>
          </div>
          {targetPercentage ? (
            <div
              className={cn(
                "flex items-center gap-1 text-sm",
                trend === "up" ? "text-chart-1" : "text-destructive"
              )}
            >
              {trend === "up" ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              {Math.abs(completion.overallPercentage - targetPercentage)}% from
              target
            </div>
          ) : null}
        </div>
        <div className="space-y-0">
          <p
            className={cn(
              "font-semibold text-base",
              trend === "up" ? "text-chart-1" : "text-muted-foreground"
            )}
          >
            {statusText}
          </p>
          {completion.activePhaseEndDate ? (
            <p className="mt-2 text-sm">
              Target: {targetPercentage}% by{" "}
              {formatMonthDay(completion.activePhaseEndDate)}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span className="font-medium">
            {completion.totalDeliverables} deliverables
          </span>
        </div>
        <Tracker className="h-4" data={trackerData} />
      </div>
    </>
  );
}

function ProjectHealthEmpty() {
  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold font-sora text-3xl">0%</p>
        <div className="space-y-1 text-right text-sm">
          <p className="font-semibold text-muted-foreground">
            No deliverables yet
          </p>
          <p className="text-[13px] text-muted-foreground leading-snug">
            Once you add deliverables and phases, progress will surface here.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="font-medium text-muted-foreground text-xs">
          No deliverables yet
        </div>
        <div className="h-4 w-full bg-border" />
      </div>
    </>
  );
}

function ProjectHealthError() {
  return (
    <>
      <div className="space-y-1">
        <p className="font-bold font-sora text-3xl text-destructive">--%</p>
        <p className="font-semibold text-destructive text-sm">
          Unable to load project health
        </p>
        <p className="text-[13px] text-muted-foreground leading-snug">
          Check your connection or try again later.
        </p>
      </div>
      <div className="space-y-2">
        <div className="font-medium text-destructive text-xs">
          Data fetch failed, retry in a moment.
        </div>
        <div className="h-4 w-full rounded-full bg-border" />
      </div>
    </>
  );
}

export async function ProjectHealthCard() {
  try {
    const { token } = await getAuthContext();
    const [deliverables, phases] = await Promise.all([
      getDeliverables(token),
      getPhases(),
    ]);
    const completion = computeProjectCompletion(deliverables, phases);
    const hasContent = completion.totalDeliverables > 0;

    return (
      <Suspense fallback={<ProjectHealthSkeleton />}>
        <FramePanel className="space-y-2 bg-card p-6">
          {hasContent ? (
            <ProjectHealthNormal completion={completion} />
          ) : (
            <ProjectHealthEmpty />
          )}
        </FramePanel>
      </Suspense>
    );
  } catch (_error) {
    return (
      <FramePanel className="space-y-2 bg-card p-6">
        <ProjectHealthError />
      </FramePanel>
    );
  }
}
