"use client";

import { Edit } from "lucide-react";
import Link from "next/link";
import { DeliverableItem } from "@/components/shared/phases/deliverable-item";
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
import { useIsTeamLead } from "@/providers/auth-context-provider";

type PhaseCardProps = {
  phase: PhaseDetail;
  onEditPhase: (phase: PhaseDetail) => void;
};

export function PhaseCard({ phase, onEditPhase }: PhaseCardProps) {
  const isTeamLead = useIsTeamLead();
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

  const _isPending = phase.startDate && new Date() < new Date(phase.startDate);

  const _isCompleted =
    phase.endDate && new Date() > new Date(phase.endDate) && progress === 100;

  return (
    <Frame className="h-fit">
      {/* Card Header */}
      <FrameHeader className="space-y-2 p-4">
        <div className="flex justify-between gap-2">
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
          {isTeamLead ? (
            <Button
              onClick={(e) => {
                e.preventDefault();
                onEditPhase(phase);
              }}
              size="icon"
              title="Edit Phase"
              variant="ghost"
            >
              <Edit size={16} />
            </Button>
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
      <FrameFooter>
        {/* View Dashboard Button */}
        <Button asChild className="w-full" variant="outline">
          <Link href={`/phases/${phase.id}`}>
            {/* <LayoutDashboard className="size-4" /> */}
            View Dashboard
          </Link>
        </Button>
      </FrameFooter>
    </Frame>
  );
}
