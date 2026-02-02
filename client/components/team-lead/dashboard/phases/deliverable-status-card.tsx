import { Info, Package } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { StatusBreakdownBar } from "@/components/ui/status-breakdown-bar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getPhasesWithDetails } from "@/lib/data/phases";

export async function DeliverableStatus({ token }: { token: string }) {
  "use cache";
  cacheLife("minutes");
  cacheTag("deliverables", "phases");

  const phasesWithDetails = await getPhasesWithDetails(token);

  const allDeliverables = phasesWithDetails.flatMap(
    (phase) => phase.deliverables?.filter((d) => !d.deletedAt) || []
  );

  const completed = allDeliverables.filter(
    (d) => d.status === "COMPLETED"
  ).length;
  const inProgress = allDeliverables.filter(
    (d) => d.status === "IN_PROGRESS"
  ).length;
  const review = allDeliverables.filter((d) => d.status === "REVIEW").length;
  const notStarted = allDeliverables.filter(
    (d) => d.status === "NOT_STARTED"
  ).length;

  const totalDeliverables = allDeliverables.length;

  return (
    <>
      {totalDeliverables === 0 ? (
        <div className="text-muted-foreground text-xs">No deliverables yet</div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium font-sora text-muted-foreground text-xs">
              {totalDeliverables} Deliverables
            </h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="p-3">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 [&_svg]:text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2 shrink-0 rounded-xs bg-chart-1" />
                    <span>{completed} Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 shrink-0 rounded-xs bg-chart-3" />
                    <span>{inProgress} In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 shrink-0 rounded-xs bg-chart-2" />
                    <span>{review} In Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 shrink-0 rounded-xs bg-muted" />
                    <span>{notStarted} Not Started</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <StatusBreakdownBar
            blocks={[
              {
                count: completed,
                color: "bg-chart-1",
                label: "Completed",
              },
              {
                count: inProgress,
                color: "bg-chart-3",
                label: "In Progress",
              },
              {
                count: review,
                color: "bg-chart-2",
                label: "In Review",
              },
              {
                count: notStarted,
                color: "bg-muted",
                label: "Not Started",
              },
            ]}
            height="h-3"
          />
        </div>
      )}
    </>
  );
}

export function DeliverableStatusCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <Package aria-hidden="true" className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Deliverable Status
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
