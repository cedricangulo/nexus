"use client";

import { Calendar, FolderXIcon } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { EditSprintDialog } from "@/components/team-lead/sprints/edit-sprint-dialog";
import { SprintActionsMenu } from "@/components/team-lead/sprints/sprint-actions-menu";
import {
  FrameDescription,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status";
import { formatDateRange } from "@/lib/helpers/format-date";
import { getSprintStatus } from "@/lib/helpers/sprint";
import type { Sprint, SprintProgress, TaskStatus } from "@/lib/types";

export function mapSprintStatusToTaskStatus(
  sprintStatus: "ACTIVE" | "PLANNED" | "COMPLETED"
): TaskStatus {
  switch (sprintStatus) {
    case "ACTIVE":
      return "IN_PROGRESS";
    case "PLANNED":
      return "TODO";
    case "COMPLETED":
      return "DONE";
    default:
      return "TODO";
  }
}

type PhaseSectionProps = {
  sprints: Sprint[];
  progressById: Record<string, SprintProgress | undefined>;
  now: Date;
};

export function PhaseSection({
  sprints,
  progressById,
  now,
}: PhaseSectionProps) {
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (sprints.length === 0) {
    return (
      <EmptyState
        description="There are no sprints in this status yet."
        icon={FolderXIcon}
        title="No sprints available"
      />
    );
  }

  return (
    <>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sprints.map((sprint) => {
          const sprintStatus = getSprintStatus(sprint, now);
          const progress = progressById[sprint.id];
          const percent = progress?.percentage ?? 0;

          return (
            <Suspense
              fallback={<Skeleton className="h-80 w-full" />}
              key={sprint.id}
            >
              <div className="group relative">
                <Link href={`/sprints/${sprint.id}`}>
                  <FramePanel className="space-y-6 bg-card">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <StatusBadge
                            status={mapSprintStatusToTaskStatus(sprintStatus)}
                          />
                          <FrameTitle className="truncate font-semibold text-base">
                            Sprint {sprint.number}
                          </FrameTitle>
                        </div>
                        <SprintActionsMenu
                          onEditClick={() => {
                            setSelectedSprint(sprint);
                            setIsEditDialogOpen(true);
                          }}
                          sprint={sprint}
                        />
                      </div>
                      <FrameDescription className="line-clamp-1">
                        {sprint.goal || "No goal set"}
                      </FrameDescription>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">
                            {progress
                              ? `${progress.completedTasks}/${progress.totalTasks}`
                              : "0/0"}
                          </span>
                        </div>
                        <Progress className="h-2" value={percent} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm [&_svg]:text-muted-foreground">
                      <Calendar size={16} />
                      <span>
                        {formatDateRange(sprint.startDate, sprint.endDate)}
                      </span>
                    </div>
                  </FramePanel>
                </Link>
              </div>
            </Suspense>
          );
        })}
      </section>

      {selectedSprint ? (
        <EditSprintDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          sprint={selectedSprint}
        />
      ) : null}
    </>
  );
}
