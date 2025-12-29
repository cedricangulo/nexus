"use client";

import { Clock } from "lucide-react";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
import { calculateOnTimePercentage } from "@/lib/helpers/meeting-analytics";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";

type OnTimeCardProps = {
  logs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
};

/**
 * OnTimeCard Component
 *
 * Displays the percentage of meetings documented on or before their sprint/phase end date
 * A meeting is on-time if its createdAt (upload date) <= sprint/phase endDate
 *
 * @param logs - Array of all meeting logs
 * @param sprints - Array of all sprints
 * @param phases - Array of all phases
 */
export default function OnTimeCard({ logs, sprints, phases }: OnTimeCardProps) {
  const onTime = calculateOnTimePercentage(logs, sprints, phases);

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <div className="rounded-md bg-linear-120 from-phase-waterfall to-phase-waterfall/80 p-2 shadow-sm">
          <Clock className="size-4 text-white" />
        </div>
        <div className="space-y-0">
          <FrameTitle className="text-sm">On-Time</FrameTitle>
          <FrameDescription className="line-clamp-1 text-xs">
            documented on time
          </FrameDescription>
        </div>
      </FrameHeader>
      <FramePanel className="flex items-center gap-4">
        <p className="font-bold font-sora text-3xl">{onTime.percentage}%</p>
        <div className="w-full">
          <Progress className="mb-2 h-2" value={onTime.percentage} />
          <FrameDescription className="line-clamp-1 text-xs">
            {onTime.onTime} of {onTime.total}
          </FrameDescription>
        </div>
      </FramePanel>
    </Frame>
  );
}
