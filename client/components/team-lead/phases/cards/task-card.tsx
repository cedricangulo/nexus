"use client";

import type { Task } from "@/lib/types";
import { AvatarGroup, PhaseItemCard } from "./phase-item-card";

type TaskCardProps = {
  task: Task;
  onClick?: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  isTeamLead?: boolean;
};

export function TaskCard({
  task,
  onClick,
  onEdit,
  onDelete,
  isTeamLead = false,
}: TaskCardProps) {
  const assignees = task.assignees || [];

  return (
    <PhaseItemCard
      description={task.description}
      footer={<AvatarGroup assignees={assignees} />}
      isTeamLead={isTeamLead}
      onClick={onClick}
      onDelete={onDelete ? () => onDelete(task) : undefined}
      onEdit={onEdit ? () => onEdit(task) : undefined}
      status={task.status}
      title={task.title}
    />
  );
}
