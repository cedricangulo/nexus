"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
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
  phase: PhaseDetail;
};

export function MemberPhaseCard({ phase }: MemberPhaseCardProps) {
  const totalDeliverables = phase.deliverables.length;
  const completedDeliverables = phase.deliverables.filter(
    (d) => d.status === DeliverableStatus.COMPLETED
  ).length;
  const progress =
    totalDeliverables > 0
      ? Math.round((completedDeliverables / totalDeliverables) * 100)
      : 0;

  const isActive =
    phase.startDate &&
    phase.endDate &&
    new Date() >= new Date(phase.startDate) &&
    new Date() <= new Date(phase.endDate);

  return (
    <Frame className="relative transition-all duration-300">
      {/* Card Header */}
      <FrameHeader className="space-y-2 p-4">
        <div className="flex-1">
          <FrameTitle className="font-bold text-foreground text-sm">
            {phase.name}
          </FrameTitle>
          {phase.startDate && phase.endDate ? (
            <FrameDescription
              className={cn(
                "text-muted-foreground text-xs",
                isLessThanWeekRemaining(phase.endDate) && "text-destructive"
              )}
            >
              {formatDate(phase.startDate)} to {formatDate(phase.endDate)}{" "}
              {progress !== 100
                ? `(${calculateDaysBetween(phase.startDate, phase.endDate)} days)`
                : null}
            </FrameDescription>
          ) : null}
        </div>
        {/* Progress Bar - Only for Active Phase */}
        {isActive ? (
          <div className="flex items-center gap-2">
            <p className="font-medium font-sora">{progress}%</p>
            <Progress className="h-2" value={progress} />
          </div>
        ) : null}
      </FrameHeader>

      {/* Card Content */}
      <FramePanel
        className={cn(
          "h-fit p-2",
          isActive ? "border-primary" : "border-border"
        )}
      >
        {/* Deliverables List */}
        <DeliverableItem deliverables={phase.deliverables} />
      </FramePanel>
      <FrameFooter className="mt-auto">
        {/* View Dashboard Button */}
        <Button asChild className="w-full" variant="outline">
          <Link href={`/phases/${phase.id}`}>
            <LayoutDashboard className="size-4" />
            View Dashboard
          </Link>
        </Button>
      </FrameFooter>
    </Frame>
  );
}
