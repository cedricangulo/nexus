"use client";

import { CheckCircle2 } from "lucide-react";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
import { calculateCoveragePercentage } from "@/lib/helpers/meeting-analytics";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";

type CoverageCardProps = {
  logs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
};

/**
 * CoverageCard Component
 *
 * Displays the percentage of valid sprints/phases that have documented meetings
 * Valid sprints/phases = have both startDate and endDate (and not soft-deleted for sprints)
 *
 * @param logs - Array of all meeting logs
 * @param sprints - Array of all sprints
 * @param phases - Array of all phases
 */
export default function CoverageCard({
  logs,
  sprints,
  phases,
}: CoverageCardProps) {
  const coverage = calculateCoveragePercentage(logs, sprints, phases);

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <div className="rounded-md bg-success p-2">
          <CheckCircle2 className="size-4 text-success-foreground" />
        </div>
        <div className="space-y-0">
          <FrameTitle className="text-sm">Coverage</FrameTitle>
          <FrameDescription className="line-clamp-1 text-xs">
            sprints/phases
          </FrameDescription>
        </div>
      </FrameHeader>
      <FramePanel className="flex items-center gap-4">
        <p className="font-bold font-sora text-3xl">{coverage.percentage}%</p>
        <div className="w-full">
          <Progress className="mb-2 h-2" value={coverage.percentage} />
          <FrameDescription className="line-clamp-1 text-xs">
            {coverage.covered} of {coverage.total}
          </FrameDescription>
        </div>
      </FramePanel>
    </Frame>
  );
}
