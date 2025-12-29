import { Barcode, Blocks, TriangleAlert } from "lucide-react";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Tracker } from "@/components/ui/tracker";
import type { DeliverablesSummary } from "@/hooks/get-deliverables-summary";
import { formatTitleCase } from "@/lib/helpers";
import { formatDate } from "@/lib/helpers/format-date";
import type { Deliverable } from "@/lib/types";

const getStatusColor = (status: string): string => {
  switch (status) {
    case "COMPLETED":
    case "DONE":
      return "bg-status-completed";
    case "IN_PROGRESS":
      return "bg-status-in-progress";
    case "REVIEW":
      return "bg-status-review";
    case "BLOCKED":
      return "bg-status-blocked";
    case "TODO":
      return "bg-status-not-started";
    default:
      return "bg-status-not-started";
  }
};

export function DeliverablesSummaryCards({
  summary,
  deliverables = [],
}: {
  summary: DeliverablesSummary;
  deliverables?: Deliverable[];
}) {
  // Sort deliverables by due date
  const sortedDeliverables = [...deliverables].sort((a, b) => {
    const dateA = a.dueDate
      ? new Date(a.dueDate).getTime()
      : Number.POSITIVE_INFINITY;
    const dateB = b.dueDate
      ? new Date(b.dueDate).getTime()
      : Number.POSITIVE_INFINITY;
    return dateA - dateB;
  });

  const trackerData = sortedDeliverables.map((deliverable) => ({
    key: deliverable.id,
    color: getStatusColor(deliverable.status),
    tooltip: `${deliverable.title} - ${formatTitleCase(deliverable.status)}${
      deliverable.dueDate ? ` (Due: ${formatDate(deliverable.dueDate)})` : ""
    }`,
  }));

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Frame>
        <FrameHeader className="flex-row items-center gap-2">
          <div className="rounded-md bg-linear-120 from-status-in-progress to-status-in-progress/80 p-2 shadow-sm">
            <Blocks className="size-4 text-white" />
          </div>
          <FrameTitle>Total Deliverables</FrameTitle>
        </FrameHeader>
        <FramePanel>
          <div className="font-bold font-sora text-3xl">{summary.total}</div>
        </FramePanel>
      </Frame>

      <Frame>
        <FrameHeader className="flex-row items-center gap-2">
          <div className="rounded-md bg-linear-120 from-status-blocked to-status-blocked/80 p-2 shadow-sm">
            <TriangleAlert className="size-4 text-white" />
          </div>
          <div className="space-y-0">
            <FrameTitle className="text-sm">Overdue</FrameTitle>
            <FrameDescription className="text-xs">
              Action needed
            </FrameDescription>
          </div>
        </FrameHeader>
        <FramePanel>
          <p className="font-bold text-3xl">{summary.overdue}</p>
        </FramePanel>
      </Frame>

      <Frame className="sm:col-span-2 lg:col-span-1">
        <FrameHeader className="flex-row items-center gap-2">
          <div className="rounded-md bg-linear-120 from-status-completed to-status-completed/80 p-2 shadow-sm">
            <Barcode className="size-4 text-white" />
          </div>
          <div className="space-y-0">
            <FrameTitle className="text-sm">Deliverables Timeline</FrameTitle>
            <FrameDescription className="text-xs">
              Sorted by due date
            </FrameDescription>
          </div>
        </FrameHeader>
        <FramePanel>
          {trackerData.length === 0 ? (
            <div className="text-muted-foreground text-xs">No deliverables</div>
          ) : (
            <Tracker data={trackerData} showTooltip />
          )}
        </FramePanel>
      </Frame>
    </section>
  );
}
