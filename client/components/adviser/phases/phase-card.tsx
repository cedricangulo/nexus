import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Frame, FrameDescription, FrameFooter, FrameHeader, FrameTitle } from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";
import type { Phase } from "@/lib/types";
import { PhaseEditButton } from "./edit-phase";
import { cn } from "@/lib/utils";
import { formatDate, isLessThanWeekRemaining } from "@/lib/helpers/format-date";

type Props = {
  phase: Phase;
  children?: React.ReactNode;
};

export default function PhaseCard({ phase, children }: Props) {
  return (
    <Frame stackedPanels>
      <FrameHeader className="p-4">
        <div className="flex justify-between gap-2">
          <div className="flex-1">
            {/* STATIC SERVER CACHED */}
            <Suspense fallback={<HeaderSkeleton />}>
              <PhaseHeader phase={phase} />
            </Suspense>
          </div>
          {/* STATIC CLIENT */}
          <PhaseEditButton phase={phase} />
        </div>
      </FrameHeader>
      {children}
      <FrameFooter>
        <Button asChild variant="secondary">
          <Link href={`/phases/${phase.id}`} prefetch>View Details</Link>
        </Button>
      </FrameFooter>
    </Frame>
  );
}

async function PhaseHeader({ phase }: { phase: Phase }) {
  return (
    <div className="flex-1">
      <FrameTitle className="font-bold text-foreground text-sm">
        {phase?.name}
      </FrameTitle>
      {phase?.startDate && phase.endDate ? (
        <FrameDescription
          className={cn(
            "text-muted-foreground text-xs",
            isLessThanWeekRemaining(phase.endDate) && "text-destructive"
          )}
        >
          {formatDate(phase.startDate)} to {formatDate(phase.endDate)}{" "}
        </FrameDescription>
      ) : null}
    </div>
  );
}


export function HeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
