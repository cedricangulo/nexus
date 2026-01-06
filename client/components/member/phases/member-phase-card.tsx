import { FolderX, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
import {
  calculateDaysBetween,
  formatDate,
  isLessThanWeekRemaining,
} from "@/lib/helpers/format-date";
import { DeliverableStatus, type PhaseDetail } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DeliverableItem } from "./deliverable-item";

type MemberPhaseCardProps = {
  phase: PhaseDetail[];
};

export function MemberPhaseCard({ phase }: MemberPhaseCardProps) {
  const allPhase = phase;

  if (allPhase.length === 0) {
    return (
      <EmptyState
        description="No phases have been created yet. Please wait for the team lead to set up the project."
        icon={FolderX}
        title="No Phases Available"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {allPhase.map((p) => {
        const totalDeliverables = p.deliverables.length;
        const completedDeliverables = p.deliverables.filter(
          (d: (typeof p.deliverables)[0]) =>
            d.status === DeliverableStatus.COMPLETED
        ).length;
        const progress =
          totalDeliverables > 0
            ? Math.round((completedDeliverables / totalDeliverables) * 100)
            : 0;

        const isActive =
          p.startDate &&
          p.endDate &&
          new Date() >= new Date(p.startDate) &&
          new Date() <= new Date(p.endDate);

        return (
          <Frame className="relative transition-all duration-300" key={p.id}>
            {/* Card Header */}
            <FrameHeader className="space-y-2 p-4">
              <div className="flex-1">
                <FrameTitle className="font-bold text-foreground text-sm">
                  {p.name}
                </FrameTitle>
                {p.startDate && p.endDate ? (
                  <FrameDescription
                    className={cn(
                      "text-muted-foreground text-xs",
                      isLessThanWeekRemaining(p.endDate) && "text-destructive"
                    )}
                  >
                    {formatDate(p.startDate)} to {formatDate(p.endDate)}{" "}
                    {progress !== 100
                      ? `(${calculateDaysBetween(p.startDate, p.endDate)} days)`
                      : null}
                  </FrameDescription>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <p className="font-medium font-sora">{progress}%</p>
                <Progress className="h-2" value={progress} />
              </div>
            </FrameHeader>

            {/* Card Content */}
            <FramePanel
              className={cn(
                "h-fit p-2",
                isActive ? "border-primary" : "border-border"
              )}
            >
              {/* Deliverables List */}
              <DeliverableItem deliverables={p.deliverables} />
            </FramePanel>
            <FrameFooter className="mt-auto">
              {/* View Dashboard Button */}
              <Button asChild className="w-full" variant="outline">
                <Link href={`/phases/${p.id}`}>
                  <LayoutDashboard className="size-4" />
                  View Dashboard
                </Link>
              </Button>
            </FrameFooter>
          </Frame>
        );
      })}
    </div>
  );
}
