"use client";

import { GripVertical } from "lucide-react";
import { TaskDescription } from "@/components/shared/sprints/task-description";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/types";

export type TaskCardProps = {
  task: Task;
  onTaskClick: (task: Task) => void;
  onBlockClick: (task: Task) => void;
  interaction?: "drag" | "tap";
};

export function TaskCard({
  task,
  onTaskClick,
  interaction = "drag",
}: TaskCardProps) {
  const cursorClass = interaction === "tap" ? "cursor-pointer" : "cursor-move";
  const assignees = task.assignees || [];

  return (
    <div
      className={`group space-y-2 rounded-md border p-3 transition-all ${cursorClass} ${
        task.status === "BLOCKED"
          ? "border-destructive/70 bg-card/20"
          : "bg-card hover:bg-accent/50"
      }`}
      onClick={() => onTaskClick(task)}
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

      {assignees.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {assignees.map((assignee) => (
            <Badge className="text-xs" key={assignee.id} variant="secondary">
              {assignee.name}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
