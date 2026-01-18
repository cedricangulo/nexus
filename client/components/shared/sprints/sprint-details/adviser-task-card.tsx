"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FramePanel } from "@/components/ui/frame";
import type { Task } from "@/lib/types";
import { cn, getInitials } from "@/lib/utils";
import { AdviserTaskDetailDialog } from "./adviser-task-detail-dialog";

type AdviserTaskCardProps = {
  task: Task;
};

export function AdviserTaskCard({ task }: AdviserTaskCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const assignees = task.assignees || [];
  const displayedAssignees = assignees.slice(0, 3);
  const remainingCount = assignees.length - 3;

  const isBlocked = task.status === "BLOCKED";

  return (
    <>
      <FramePanel
        className={cn(
          "cursor-pointer transition-colors",
          isBlocked && "border-destructive/70 bg-card/20"
        )}
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex flex-col gap-2">
          {/* Title */}
          <h4 className="line-clamp-2 font-medium text-sm leading-tight">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="line-clamp-2 text-muted-foreground text-xs">
              {task.description}
            </p>
          )}

          {/* Assignees */}
          {assignees.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {displayedAssignees.map((assignee) => (
                  <Avatar
                    className="size-6 border border-background"
                    key={assignee.id}
                  >
                    <AvatarFallback className="text-[10px]">
                      {getInitials(assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {remainingCount > 0 && (
                <Badge className="text-[10px]" variant="secondary">
                  +{remainingCount}
                </Badge>
              )}
            </div>
          )}
        </div>
      </FramePanel>

      <AdviserTaskDetailDialog
        onOpenChange={setIsDialogOpen}
        open={isDialogOpen}
        task={task}
      />
    </>
  );
}
