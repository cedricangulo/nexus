"use client";

import { AlertCircle } from "lucide-react";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { calculateMissingMeetings } from "@/lib/helpers/meeting-analytics";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";
import { cn } from "@/lib/utils";

type MissingMeetingsCardProps = {
  logs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
};

/**
 * MissingMeetingsCard Component
 *
 * Displays the count of valid sprints/phases that do NOT have documented meetings
 * This helps identify documentation gaps that need attention
 *
 * @param logs - Array of all meeting logs
 * @param sprints - Array of all sprints
 * @param phases - Array of all phases
 */
export default function MissingMeetingsCard({
  logs,
  sprints,
  phases,
}: MissingMeetingsCardProps) {
  const missing = calculateMissingMeetings(logs, sprints, phases);

  const isAlert = missing.count > 0;

  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <div
          className={`rounded-md p-2 ${isAlert ? "bg-error/70" : "bg-info"}`}
        >
          <AlertCircle
            className={cn(
              "size-4",
              isAlert ? "text-error-foreground" : "text-info-foreground"
            )}
          />
        </div>
        <div className="space-y-0">
          <FrameTitle className="text-sm">Missing</FrameTitle>
          <FrameDescription className="text-xs">Meetings</FrameDescription>
        </div>
      </FrameHeader>
      <FramePanel>
        <div className="flex items-end gap-2">
          <p className="font-bold font-sora text-3xl">{missing.count}</p>
          <p className="grid text-muted-foreground text-xs">
            <span>
              {missing.sprints.length > 0 && (
                <>
                  {missing.sprints.length} sprint
                  {missing.sprints.length !== 1 ? "s" : ""}
                  {missing.phases.length > 0 && " and "}
                </>
              )}
            </span>
            <span>
              {missing.phases.length > 0 && (
                <>
                  {missing.phases.length} phase
                  {missing.phases.length !== 1 ? "s" : ""}
                </>
              )}
            </span>
            <span>{missing.count > 0 && " without meetings"}</span>
          </p>
        </div>
      </FramePanel>
    </Frame>
  );
}
