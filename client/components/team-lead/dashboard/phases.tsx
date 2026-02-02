import { Suspense } from "react";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthContext } from "@/lib/helpers/auth-token";
import {
  DeliverableStatus,
  DeliverableStatusCard,
} from "./phases/deliverable-status-card";
import {
  DeliverablesDueSoon,
  DeliverablesDueSoonCard,
} from "./phases/deliverables-due-soon-card";
import {
  OverallProgress,
  OverallProgressCard,
} from "./phases/overall-progress-card";
import {
  PhaseProgressSkeleton,
  PhaseProgressTimelineDisplay,
} from "./phases/phase-progress-timeline-server";
import { TaskStatus, TaskStatusCard } from "./phases/task-status-card";

export default async function PhasesTab() {
  const { token } = await getAuthContext();

  return (
    <div className="space-y-6 py-6">
      {/* Zone A: Metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverallProgressCard>
          <Suspense
            fallback={
              <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-8" />
                <ProgressCircle
                  color="stroke-chart-1"
                  progress={0}
                  size={32}
                  strokeWidth={4}
                  withoutText
                />
              </div>
            }
          >
            <OverallProgress token={token} />
          </Suspense>
        </OverallProgressCard>

        <DeliverableStatusCard>
          <Suspense
            fallback={
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-full rounded-xs" />
              </div>
            }
          >
            <DeliverableStatus token={token} />
          </Suspense>
        </DeliverableStatusCard>

        <TaskStatusCard>
          <Suspense
            fallback={
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-full rounded-xs" />
              </div>
            }
          >
            <TaskStatus token={token} />
          </Suspense>
        </TaskStatusCard>

        <DeliverablesDueSoonCard>
          <Suspense fallback={<Skeleton className="h-9 w-8" />}>
            <DeliverablesDueSoon token={token} />
          </Suspense>
        </DeliverablesDueSoonCard>
      </section>

      <Suspense fallback={<PhaseProgressSkeleton />}>
        <PhaseProgressTimelineDisplay token={token} />
      </Suspense>
    </div>
  );
}
