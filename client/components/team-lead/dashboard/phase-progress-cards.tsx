/**
 * Phase Progress Cards
 * Server component that fetches phase data and displays progress
 */
// import { Droplet, RefreshCw, Rocket } from "lucide-react";
import { Suspense } from "react";
import { CategoryBar } from "@/components/ui/category-bar";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status";
import { deliverableApi } from "@/lib/api/deliverable";
import { phaseApi } from "@/lib/api/phase";
import { computePhaseProgress } from "@/lib/helpers/dashboard-computations";
import type { DeliverableStatus, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PhaseCardsSkeleton } from "./skeletons";

// const PHASE_ICONS = {
//   WATERFALL: Droplet,
//   SCRUM: RefreshCw,
//   FALL: Rocket,
// } as const;

// Get phase-specific gradient classes
// function getPhaseGradientClass(type: keyof typeof PHASE_ICONS): string {
//   switch (type) {
//     case "WATERFALL":
//       return "bg-linear-120 from-phase-waterfall to-phase-waterfall/80";
//     case "SCRUM":
//       return "bg-linear-120 from-phase-scrum to-phase-scrum/80";
//     case "FALL":
//       return "bg-linear-120 from-phase-fall to-phase-fall/80";
//   }
// }

// Map phase status to deliverable status enum, with actual work as fallback
function mapPhaseStatusToEnum(
  status: "Completed" | "Active" | "Pending" | "At Risk",
  completionPercentage: number,
  inProgressCount: number
): DeliverableStatus | TaskStatus {
  if (completionPercentage === 100) {
    return "COMPLETED";
  }
  if (completionPercentage > 0 || inProgressCount > 0) {
    return "IN_PROGRESS";
  }

  switch (status) {
    case "At Risk":
      return "BLOCKED";
    default:
      return "NOT_STARTED";
  }
}

function PhaseProgressNormal({
  phasesWithProgress,
}: {
  phasesWithProgress: ReturnType<typeof computePhaseProgress>[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {phasesWithProgress.map((phase) => {
        // const Icon = PHASE_ICONS[phase.type];
        const isActive = phase.status === "Active";

        return (
          <Frame className="relative transition-all" key={phase.id}>
            <FrameHeader className="flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* <div className={cn("rounded-md p-2 shadow-sm", getPhaseGradientClass(phase.type))}>
                  <Icon className="text-white" size={16} />
                </div> */}
                <FrameTitle className="line-clamp-1 text-sm">
                  {phase.name}
                </FrameTitle>
              </div>
              <StatusBadge
                status={mapPhaseStatusToEnum(
                  phase.status,
                  phase.completionPercentage,
                  phase.inProgressDeliverables
                )}
              />
            </FrameHeader>

            <FramePanel
              className={cn(
                "space-y-2",
                isActive ? "border-primary shadow-primary/50" : null
              )}
            >
              <div className="flex items-end justify-between">
                <p className="font-sora text-muted-foreground text-xs">
                  {phase.completedDeliverables + phase.inProgressDeliverables} /{" "}
                  {phase.totalDeliverables}
                </p>
                <span className="font-bold font-sora text-xl tabular-nums">
                  {phase.completionPercentage}%
                </span>
              </div>

              <div className="space-y-2">
                <CategoryBar
                  className="h-2"
                  colors={[
                    "status-success",
                    "status-in-progress",
                    "status-warning",
                    "status-info",
                  ]}
                  showLabels={false}
                  values={[
                    phase.completedDeliverables,
                    phase.inProgressDeliverables,
                    phase.reviewDeliverables,
                    phase.notStartedDeliverables,
                  ]}
                />
              </div>
            </FramePanel>
          </Frame>
        );
      })}
    </div>
  );
}

function PhaseProgressEmpty() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Frame className="relative transition-all">
        <FramePanel className="space-y-2 text-center">
          <p className="font-semibold text-muted-foreground text-sm">
            No phases configured yet
          </p>
          <p className="text-muted-foreground text-xs">
            Define your project phases to visualize their progress here.
          </p>
        </FramePanel>
      </Frame>
    </div>
  );
}

function PhaseProgressError() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Frame className="relative transition-all">
        <FramePanel className="space-y-2 text-center">
          <p className="font-semibold text-destructive text-sm">
            Unable to load phase progress
          </p>
          <p className="text-muted-foreground text-xs">
            Refresh the page or try again later.
          </p>
        </FramePanel>
      </Frame>
    </div>
  );
}

export async function PhaseProgressCardsDisplay() {
  try {
    const [deliverables, phases] = await Promise.all([
      deliverableApi.listDeliverables(),
      phaseApi.listPhases(),
    ]);

    if (phases.length === 0) {
      return (
        <>
          <PhaseProgressEmpty />
          <Separator />
        </>
      );
    }

    const phasesWithProgress = phases.map((phase) =>
      computePhaseProgress(phase, deliverables)
    );

    return (
      <>
        <Suspense fallback={<PhaseCardsSkeleton />}>
          <PhaseProgressNormal phasesWithProgress={phasesWithProgress} />
        </Suspense>
        <Separator />
      </>
    );
  } catch (_error) {
    return (
      <>
        <PhaseProgressError />
        <Separator />
      </>
    );
  }
}
