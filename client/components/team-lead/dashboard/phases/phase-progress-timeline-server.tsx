import { Calendar } from "lucide-react";
import { cacheTag } from "next/cache";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";
import { getPhasesWithDetails } from "@/lib/data/phases";
import { PhaseProgressTimeline } from "./phase-progress-timeline";
import { PhaseSelector } from "./phase-selector";

export async function PhaseProgressTimelineDisplay({
  token,
}: {
  token: string;
}) {
  "use cache";
  cacheTag("phases");

  const phasesWithDetails = await getPhasesWithDetails(token);

  if (phasesWithDetails.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground text-sm">
          No phases configured yet
        </p>
      </div>
    );
  }

  // Sort by phase type: WATERFALL => SCRUM => FALL
  const phaseTypeOrder = { WATERFALL: 0, SCRUM: 1, FALL: 2 };
  const sortedPhases = phasesWithDetails.sort((a, b) => {
    const aOrder = phaseTypeOrder[a.type] ?? 999;
    const bOrder = phaseTypeOrder[b.type] ?? 999;
    return aOrder - bOrder;
  });

  return (
    <Frame stackedPanels>
      <FrameHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            <FrameTitle className="font-normal text-muted-foreground text-sm">
              Phase Progress
            </FrameTitle>
          </div>
          <PhaseSelector phases={sortedPhases} />
        </div>
      </FrameHeader>
      <PhaseProgressTimeline phases={sortedPhases} />
    </Frame>
  );
}

export function PhaseProgressSkeleton() {
  const renderSection = (
    title: string,
    items: Array<{ label: string; color: string }>
  ) => (
    <div>
      <h4 className="font-medium text-sm">{title}</h4>
      <Skeleton className="mt-2 mb-2 h-3 w-full rounded-xs" />
      <div className="space-y-2 text-sm">
        {items.map(({ label, color }) => (
          <div
            className="flex items-center justify-between gap-3 text-xs"
            key={label}
          >
            <div className="flex items-center gap-2">
              <div
                aria-hidden="true"
                className={`size-2 rounded-xs ${color}`}
              />
              <span className="text-muted-foreground">{label}</span>
            </div>
            <Skeleton className="h-4 w-2" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Frame stackedPanels>
      <FrameHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            <FrameTitle className="font-normal text-muted-foreground text-sm">
              Phase Progress
            </FrameTitle>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </FrameHeader>
      <FramePanel className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-32" />
      </FramePanel>
      <FramePanel className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {renderSection("Tasks", [
          { label: "Done", color: "bg-chart-1" },
          { label: "In Progress", color: "bg-chart-3" },
          { label: "Blocked", color: "bg-chart-4" },
          { label: "To Do", color: "bg-muted" },
        ])}
        {renderSection("Deliverables", [
          { label: "Completed", color: "bg-chart-1" },
          { label: "In Progress", color: "bg-chart-3" },
          { label: "In Review", color: "bg-chart-2" },
          { label: "Not Started", color: "bg-muted" },
        ])}
      </FramePanel>
    </Frame>
  );
}
