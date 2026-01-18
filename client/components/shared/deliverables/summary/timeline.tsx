import { Barcode } from "lucide-react";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Tracker } from "@/components/ui/tracker";
import { getDeliverablesForTimeline } from "@/lib/data/deliverables";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { formatTitleCase } from "@/lib/helpers";
import { formatDate } from "@/lib/helpers/format-date";
import { searchParamsCache } from "@/lib/types/search-params";
import type { Deliverable } from "@/lib/types";

const getStatusColor = (status: string): string => {
  switch (status) {
    case "COMPLETED":
    case "DONE":
      return "bg-chart-1";
    case "IN_PROGRESS":
      return "bg-chart-3";
    case "REVIEW":
      return "bg-chart-2";
    case "BLOCKED":
      return "bg-chart-4";
    case "TODO":
      return "bg-accent";
    default:
      return "bg-accent";
  }
};

function TimelineTracker({ deliverables }: { deliverables: Deliverable[] }) {
  const trackerData = deliverables.map((deliverable) => ({
    key: deliverable.id,
    color: getStatusColor(deliverable.status),
    tooltip: `${deliverable.title} - ${formatTitleCase(deliverable.status)}${
      deliverable.dueDate ? ` (Due: ${formatDate(deliverable.dueDate)})` : ""
    }`,
  }));

  if (trackerData.length === 0) {
    return (
      <div className="text-muted-foreground text-xs">No deliverables</div>
    );
  }

  return <Tracker data={trackerData} showTooltip />;
}

type TimelineCardProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function Timeline({ searchParams }: TimelineCardProps) {
  const { token } = await getAuthContext();
  const filters = searchParamsCache.parse(await searchParams);
  const deliverables = await getDeliverablesForTimeline(token, filters);

  return <TimelineTracker deliverables={deliverables} />;
}

export async function TimelineCard({ children }: { children?: React.ReactNode }) {
  "use cache"

  return (
    <Frame className="sm:col-span-2 lg:col-span-1">
      <FrameHeader className="flex-row items-center gap-2">
        <div className="rounded-md bg-success p-2">
          <Barcode className="size-4 text-success-foreground" />
        </div>
        <div className="space-y-0">
          <FrameTitle className="text-sm">Deliverables Timeline</FrameTitle>
          <FrameDescription className="text-xs">
            Sorted by due date
          </FrameDescription>
        </div>
      </FrameHeader>
      <FramePanel>
        {children}
      </FramePanel>
    </Frame>
  );
}
