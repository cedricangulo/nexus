"use client";

import type { Task } from "@/lib/types";
import { AvatarGroup, TaskItemActions } from "./cards/items/task-item-client";

type TaskCardProps = {
  task: Task;
  onClick?: () => void;
  onEdit?: (task: Task) => void;
  onEditStatus?: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

export function TaskCard({
  task,
  onClick,
  onEdit,
  onEditStatus,
  onViewDetails,
  onDelete,
}: TaskCardProps) {
  const assignees = task.assignees || [];

  const actions = {
    onClick,
    onDelete: onDelete ? () => onDelete(task) : undefined,
    onEdit: onEdit ? () => onEdit(task) : undefined,
    onEditStatus: onEditStatus ? () => onEditStatus(task) : undefined,
    onViewDetails: onViewDetails ? () => onViewDetails(task) : undefined,
  };

  return (
    <TaskItemActions
      actions={actions}
      description={task.description}
      footer={<AvatarGroup assignees={assignees} />}
      status={task.status}
      task={task}
      title={task.title}
    />
  );
}
