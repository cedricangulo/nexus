import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { ProjectProgress } from "./overview/project-progress";
import { ProjectProgressCard } from "./overview/project-progress-card";
import { TaskStatusBreakdown } from "./overview/task-status-breakdown";
import { TaskStatusBreakdownCard } from "./overview/task-status-breakdown-card";
import { TotalSprints } from "./overview/total-sprint";
import { TotalSprintsCard } from "./overview/total-sprints-card";

/**
 * Dashboard Overview Component
 * Main entry point for analytics overview section
 */
export default async function Overview() {
  const { token } = await getAuthContext();

  return (
    <>
      {/* Metrics Grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ProjectProgressCard>
          <Suspense
            fallback={
              <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-8" />
                <Skeleton className="size-8 rounded-full" />
              </div>
            }
          >
            <ProjectProgress token={token} />
          </Suspense>
        </ProjectProgressCard>

        <TotalSprintsCard>
          <Suspense fallback={<Skeleton className="h-9 w-4" />}>
            <TotalSprints token={token} />
          </Suspense>
        </TotalSprintsCard>

        {/* <TotalTasksCard>
        <Suspense fallback={<Skeleton className="h-9 w-8" />}>
						<TotalTasks />
					</Suspense>
				</TotalTasksCard> */}

        <TaskStatusBreakdownCard>
          <Suspense
            fallback={
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-full rounded-xs" />
              </div>
            }
          >
            <TaskStatusBreakdown token={token} />
          </Suspense>
        </TaskStatusBreakdownCard>
      </section>
    </>
  );
}
