import { cacheTag } from "next/cache";
import { FramePanel } from "@/components/ui/frame";
import { getPhaseAnalytics } from "@/lib/data/phases";
import { cn } from "@/lib/utils";

interface Props {
  phaseId: string;
  token: string;
}

interface TaskAnalytics {
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  totalTasks: number;
}

interface DeliverableAnalytics {
  completedDeliverables: number;
  inProgressDeliverables: number;
  underReviewDeliverables: number;
  totalDeliverables: number;
}

interface MeetingAnalytics {
  totalMeetings: number;
}

interface Analytics {
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  totalTasks: number;
  completedDeliverables: number;
  inProgressDeliverables: number;
  underReviewDeliverables: number;
  totalDeliverables: number;
  totalMeetings: number;
  taskCompletion: number;
  deliverableCompletion: number;
}

/**
 * CONTAINER
 * Now accepts token to avoid cookie errors.
 */
export default async function PhaseProgressDisplay({ phaseId, token }: Props) {
  // Pass the token to the fetcher!
  const analytics = await getPhaseAnalytics(phaseId, token);

  if (!analytics) {
    return (
      <div className="text-muted-foreground text-sm">
        Unable to load phase analytics
      </div>
    );
  }

  return <CachedProgressUI analytics={analytics} phaseId={phaseId} />;
}

/**
 * PRESENTER (Static Shell)
 * Receives analytics as props, safe to cache.
 */
async function CachedProgressUI({
  analytics,
  phaseId,
}: {
  analytics: Analytics;
  phaseId: string;
}) {
  "use cache";
  cacheTag("phase-analytics", `phase-${phaseId}`);

  return (
    <>
      {/* Task Progress */}
      <TaskPanel analytics={analytics} />

      {/* Deliverable Progress */}
      <DeliverablePanel analytics={analytics} />

      {/* Meetings Count */}
      <MeetingsPanel analytics={analytics} />
    </>
  );
}

function TaskPanel({ analytics }: { analytics: TaskAnalytics }) {
  return (
    <FramePanel className="space-y-2">
      <h4 className="font-medium text-muted-foreground text-sm">Tasks</h4>
      {analytics.totalTasks === 0 ? (
        <div className="h-2 w-full rounded-xs bg-muted" />
      ) : (
        <div className="flex gap-0.5">
          {[
            ...new Array(analytics.completedTasks).fill({
              status: "completed",
              color: "bg-chart-1",
              title: "Completed",
            }),
            ...new Array(analytics.inProgressTasks).fill({
              status: "in-progress",
              color: "bg-chart-3",
              title: "In Progress",
            }),
            ...new Array(analytics.blockedTasks).fill({
              status: "blocked",
              color: "bg-chart-4",
              title: "Blocked",
            }),
            ...new Array(
              analytics.totalTasks -
                analytics.completedTasks -
                analytics.inProgressTasks -
                analytics.blockedTasks
            ).fill({
              status: "pending",
              color: "bg-muted",
              title: "Pending",
            }),
          ].map((block, i) => (
            <div
              className={cn("h-2 flex-1 rounded-xs", block.color)}
              key={`${block.status}-${i}`}
              title={block.title}
            />
          ))}
        </div>
      )}
    </FramePanel>
  );
}

function DeliverablePanel({ analytics }: { analytics: DeliverableAnalytics }) {
  if (analytics.totalDeliverables === 0) {
    return null;
  }
  return (
    <FramePanel className="space-y-2">
      <h4 className="font-medium text-muted-foreground text-sm">
        Deliverables
      </h4>
      <div className="flex gap-0.5">
        {[
          ...new Array(analytics.completedDeliverables).fill({
            status: "completed",
            color: "bg-chart-1",
            title: "Completed",
          }),
          ...new Array(analytics.inProgressDeliverables).fill({
            status: "in-progress",
            color: "bg-chart-3",
            title: "In Progress",
          }),
          ...new Array(analytics.underReviewDeliverables).fill({
            status: "review",
            color: "bg-chart-2",
            title: "Review",
          }),
          ...new Array(
            analytics.totalDeliverables -
              analytics.completedDeliverables -
              analytics.inProgressDeliverables -
              analytics.underReviewDeliverables
          ).fill({
            status: "pending",
            color: "bg-muted",
            title: "Pending",
          }),
        ].map((block, i) => (
          <div
            className={cn("h-2 flex-1 rounded-xs", block.color)}
            key={`${block.status}-${i}`}
            title={block.title}
          />
        ))}
      </div>
    </FramePanel>
  );
}

function MeetingsPanel({ analytics }: { analytics: MeetingAnalytics }) {
  return (
    <FramePanel className="flex items-center justify-between space-y-2">
      <h4 className="font-medium text-muted-foreground text-sm">Meetings</h4>
      <p className="font-bold font-sora text-3xl">{analytics.totalMeetings}</p>
    </FramePanel>
  );
}
