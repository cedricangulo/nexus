"use client";

import { GripVertical } from "lucide-react";
import { TaskDescription } from "@/components/shared/sprints/task-description";
import type { Task } from "@/lib/types";

export type MemberTaskCardProps = {
  task: Task;
  interaction?: "tap" | "drag";
  onTaskClick?: (task: Task) => void;
  onBlockClick?: (task: Task) => void;
};

/**
 * Display-only task card for members
 * Shows task title and description
 * Used in member Kanban board for drag-and-drop
 * Can trigger task detail dialog via onTaskClick callback
 */
export function MemberTaskCard({
  task,
  interaction = "drag",
  onTaskClick,
  onBlockClick,
}: MemberTaskCardProps) {
  const cursorClass = interaction === "tap" ? "cursor-pointer" : "cursor-move";

  return (
    <div
      className={`group space-y-2 rounded-md border p-3 transition-all ${cursorClass} ${
        task.status === "BLOCKED"
          ? "border-destructive/70 bg-card/20"
          : "bg-card hover:bg-accent/50"
      }`}
      onClick={() => {
        if (task.status === "BLOCKED" && onBlockClick) {
          onBlockClick(task);
        } else {
          onTaskClick?.(task);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (task.status === "BLOCKED" && onBlockClick) {
            onBlockClick(task);
          } else if (onTaskClick) {
            onTaskClick(task);
          }
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex justify-between gap-2">
        <div className="space-y-1">
          <p className="line-clamp-2 font-medium">{task.title}</p>
          {task.description ? (
            <TaskDescription content={task.description} />
          ) : null}
        </div>
        <GripVertical className="hidden size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground md:block" />
      </div>
    </div>
  );
}
