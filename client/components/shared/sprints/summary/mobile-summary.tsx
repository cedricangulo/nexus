import { IterationCcw } from "lucide-react";
import { Suspense } from "react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";
import { Active } from "./active";
import { Total } from "./total";
import { Upcoming } from "./upcoming";

export const SUMMARY_ITEMS = [
  { label: "Total", Component: Total, colorClass: "text-info-foreground" },
  {
    label: "Active",
    Component: Active,
    colorClass: "text-success-foreground",
  },
  {
    label: "Upcoming",
    Component: Upcoming,
    colorClass: "text-warning-foreground",
  },
] as const;

export function SummaryCardItem({
  label,
  Component,
  colorClass,
  searchParams,
}: {
  label: string;
  Component: React.ComponentType<{
    searchParams: Record<string, string | string[] | undefined>;
  }>;
  colorClass: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <div className={colorClass}>
      <Suspense fallback={<Skeleton className="mx-auto h-9 w-4" />}>
        <Component searchParams={searchParams} />
      </Suspense>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}

export async function MobileSummary({
  children,
}: {
  children: React.ReactNode;
}) {
  "use cache";

  return (
    <Frame className="sm:hidden">
      <FrameHeader className="flex-row items-center gap-2">
        <div className="rounded-md bg-success p-2">
          <IterationCcw className="size-4 text-success-foreground" />
        </div>
        <FrameTitle>Sprint Summary</FrameTitle>
      </FrameHeader>
      <FramePanel className="divide grid grid-cols-3 divide-x divide-dashed text-center p-2">
        {children}
      </FramePanel>
    </Frame>
  );
}
