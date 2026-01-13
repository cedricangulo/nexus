"use client";

import type { Task } from "@/lib/types";
import { AvatarGroup, TaskItemActions } from "./cards/items/task-item-client";

type TaskCardProps = {
  task: Task;
  onClick?: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

export function TaskCard({ task, onClick, onEdit, onDelete }: TaskCardProps) {
  const assignees = task.assignees || [];

  return (
    <TaskItemActions
      description={task.description}
      footer={<AvatarGroup assignees={assignees} />}
      onClick={onClick}
      onDelete={onDelete ? () => onDelete(task) : undefined}
      onEdit={onEdit ? () => onEdit(task) : undefined}
      status={task.status}
      title={task.title}
    />
  );
}
