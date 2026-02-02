import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { AvgVelocity } from "./sprints/avg-velocity";
import { AvgVelocityCard } from "./sprints/avg-velocity-card";
import { BlockedTasks } from "./sprints/blocked-tasks";
import { BlockedTasksAlertCard } from "./sprints/blocked-tasks-alert-card";
import {
  BurndownChart,
  BurndownChartCard,
} from "./sprints/burndown-chart-server";
import { DaysRemaining } from "./sprints/days-remaining";
import { DaysRemainingCard } from "./sprints/days-remaining-card";
import { TaskSummary } from "./sprints/task-summary";
import { TaskSummaryCard } from "./sprints/task-summary-card";
import {
  VelocityChart,
  VelocityChartCard,
} from "./sprints/velocity-chart-server";

export default async function SprintsTab() {
  const { token } = await getAuthContext();

  return (
    <div className="space-y-6 py-6">
      {/* Zone A: Metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DaysRemainingCard>
          <Suspense fallback={<Skeleton className="h-12 w-16" />}>
            <DaysRemaining token={token} />
          </Suspense>
        </DaysRemainingCard>

        {/* <CompletedSprintsCard>
          <Suspense fallback={<Skeleton className="h-12 w-8" />}>
            <CompletedSprints />
          </Suspense>
        </CompletedSprintsCard> */}
        <AvgVelocityCard>
          <Suspense fallback={<Skeleton className="h-12 w-12" />}>
            <AvgVelocity token={token} />
          </Suspense>
        </AvgVelocityCard>

        <BlockedTasksAlertCard>
          <Suspense fallback={<Skeleton className="h-12 w-8" />}>
            <BlockedTasks token={token} />
          </Suspense>
        </BlockedTasksAlertCard>

        <TaskSummaryCard>
          <Suspense
            fallback={
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-full rounded-xs" />
              </div>
            }
          >
            <TaskSummary token={token} />
          </Suspense>
        </TaskSummaryCard>
      </section>

      {/* Zone B: Charts */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <VelocityChartCard>
          <Suspense fallback={<Skeleton className="h-75 w-full" />}>
            <VelocityChart token={token} />
          </Suspense>
        </VelocityChartCard>

        <BurndownChartCard>
          <Suspense fallback={<Skeleton className="h-75 w-full" />}>
            <BurndownChart token={token} />
          </Suspense>
        </BurndownChartCard>
      </section>
    </div>
  );
}
