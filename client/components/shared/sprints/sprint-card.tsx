"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SprintActionsMenu } from "@/components/shared/sprints/sprint-actions";
import { SprintFormDialog } from "@/components/shared/sprints/sprint-form-dialog";
import {
  FrameDescription,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status";
import { getSprintStatus, mapSprintStatusToTaskStatus } from "@/lib/helpers";
import { formatDateRange } from "@/lib/helpers/format-date";
import type { Sprint, SprintProgress } from "@/lib/types";
import { useIsTeamLead } from "@/providers/auth-context-provider";

type SprintCardProps = {
  sprint: Sprint;
  progress: SprintProgress | undefined;
  isTeamLead: boolean;
};

/**
 * Sprint card wrapper component
 * Handles conditional rendering for team lead (with actions menu) vs member (with link)
 * Manages edit dialog state for team leads
 */
export function SprintCard({ sprint, progress, isTeamLead }: SprintCardProps) {
  const now = new Date();
  const sprintStatus = getSprintStatus(sprint, now);

  const content = (
    <>
      <FramePanel className="space-y-6 bg-card transition-colors hover:bg-card/60">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <StatusBadge status={mapSprintStatusToTaskStatus(sprintStatus)} />
              <FrameTitle className="mt-2 truncate font-semibold text-base">
                Sprint {sprint.number}
              </FrameTitle>
            </div>
            <SprintCardMenu sprint={sprint} />
          </div>
          <FrameDescription className="line-clamp-1">
            {sprint.goal || "No goal set"}
          </FrameDescription>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium font-sora">
                {progress
                  ? `${progress.completedTasks}/${progress.totalTasks}`
                  : "0/0"}
              </span>
            </div>
            <Progress className="h-2" value={progress?.percentage ?? 0} />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm [&_svg]:text-muted-foreground">
          <Calendar size={16} />
          <span>{formatDateRange(sprint.startDate, sprint.endDate)}</span>
        </div>
      </FramePanel>
    </>
  );

  if (isTeamLead) {
    return content;
  }

  return <Link href={`/sprints/${sprint.id}`}>{content}</Link>;
}

function SprintCardMenu({ sprint }: { sprint: Sprint }) {
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isTeamLead = useIsTeamLead();

  if (!isTeamLead) {
    return null;
  }

  return (
    <>
      <SprintActionsMenu
        onEditClick={() => {
          setSelectedSprint(sprint);
          setIsEditDialogOpen(true);
        }}
        sprint={sprint}
      />

      {selectedSprint ? (
        <SprintFormDialog
          onOpenChange={setIsEditDialogOpen}
          open={isEditDialogOpen}
          sprint={selectedSprint}
        />
      ) : null}
    </>
  );
}
