import { TrendingUp } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { getPhasesWithDetails } from "@/lib/data/phases";

export async function OverallProgress({ token }: { token: string }) {
  "use cache";
  cacheLife("minutes");
  cacheTag("deliverables", "phases", "tasks");

  const phasesWithDetails = await getPhasesWithDetails(token);

  // Collect all deliverables and tasks from all phases
  const allDeliverables = phasesWithDetails.flatMap(
    (phase) => phase.deliverables?.filter((d) => !d.deletedAt) || []
  );

  const allTasks = phasesWithDetails.flatMap(
    (phase) => phase.tasks?.filter((t) => !t.deletedAt) || []
  );

  // Calculate completed items
  const completedDeliverables = allDeliverables.filter(
    (d) => d.status === "COMPLETED"
  ).length;
  const completedTasks = allTasks.filter((t) => t.status === "DONE").length;

  const totalCompleted = completedDeliverables + completedTasks;
  const totalItems = allDeliverables.length + allTasks.length;

  const percentage =
    totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return (
    <div className="flex items-center justify-between gap-4">
      <h4 className="font-bold font-sora text-3xl">{percentage}%</h4>
      <ProgressCircle
        color="stroke-chart-1"
        progress={percentage}
        size={32}
        strokeWidth={4}
        withoutText
      />
    </div>
  );
}

export function OverallProgressCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <TrendingUp
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Overall Progress
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
