"use client";

import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FramePanel } from "@/components/ui/frame";
import { StatusBadge } from "@/components/ui/status";
import type { DeliverableStatus, Task, TaskStatus } from "@/lib/types";
import { cn, getInitials } from "@/lib/utils";
import {
  useAuthContext,
  useIsAdviser,
  useIsTeamLead,
} from "@/providers/auth-context-provider";

type TaskItemActionsContent = {
  title: string;
  status: TaskStatus | DeliverableStatus;
  description?: string | null;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

type TaskActionHandlers = {
  onClick?: () => void;
  onEdit?: () => void;
  onEditStatus?: () => void;
  onViewDetails?: () => void;
  onDelete?: () => void;
};

type TaskItemActionsProps = TaskItemActionsContent & {
  actions?: TaskActionHandlers;
  task?: Task;
};

export function TaskItemActions({
  title,
  status,
  description,
  actions,
  task,
  className,
  children,
  footer,
}: TaskItemActionsProps) {
  const isTeamLead = useIsTeamLead();
  const isAdviser = useIsAdviser();
  const { user } = useAuthContext();

  // Check if user is assigned to the task
  const isAssigned = task?.assignees?.some(
    (assignee) => assignee.id === user.id
  );

  // Extract handlers from grouped actions
  const onClick = actions?.onClick;
  const onEdit = actions?.onEdit;
  const onEditStatus = actions?.onEditStatus;
  const onViewDetails = actions?.onViewDetails;
  const onDelete = actions?.onDelete;

  // Determine if the card should be clickable
  const isClickable = !!onClick && isTeamLead;

  // Show dropdown for all authenticated users
  const showDropdown = !!(onEdit || onEditStatus || onViewDetails || onDelete);

  return (
    <FramePanel
      className={cn(
        "flex flex-col gap-2 p-2",
        isClickable && "cursor-pointer",
        className
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <StatusBadge status={status} />
          {children}
          <h4 className="mt-2 font-medium text-sm leading-tight">{title}</h4>
        </div>
        {showDropdown ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
                size="icon"
                variant="ghost"
              >
                <MoreVertical size={16} />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* View Details - for advisers and unassigned members */}
              {(isAdviser || !isTeamLead) && onViewDetails && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails();
                  }}
                >
                  <Eye size={16} />
                  View Details
                </DropdownMenuItem>
              )}

              {/* Edit Status - for assigned members only (not team leads or advisers) */}
              {!(isTeamLead || isAdviser) && isAssigned && onEditStatus ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStatus();
                  }}
                >
                  <Pencil size={16} />
                  Edit Status
                </DropdownMenuItem>
              ) : null}

              {/* Edit - for team leads and assigned members (not advisers) */}
              {!isAdviser && (isTeamLead || isAssigned) && onEdit ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Pencil size={16} />
                  {isTeamLead ? "Edit" : "Edit Status"}
                </DropdownMenuItem>
              ) : null}

              {/* Delete - team leads only */}
              {isTeamLead && onDelete ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    variant="destructive"
                  >
                    <Trash2 size={16} />
                    Delete
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {description ? (
        <p className="line-clamp-2 text-muted-foreground text-xs">
          {description}
        </p>
      ) : null}

      {footer ? <div className="mt-1">{footer}</div> : null}
    </FramePanel>
  );
}

// Avatar group component for tasks
type AvatarGroupProps = {
  assignees: Array<{ id: string; name: string }>;
  maxDisplay?: number;
};

export function AvatarGroup({ assignees, maxDisplay = 3 }: AvatarGroupProps) {
  const displayedAssignees = assignees.slice(0, maxDisplay);
  const remainingCount = assignees.length - maxDisplay;

  if (assignees.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {displayedAssignees.map((assignee) => (
          <Avatar className="size-6 border border-background" key={assignee.id}>
            <AvatarFallback className="text-[10px]">
              {getInitials(assignee.name)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {remainingCount > 0 && (
        <span className="ml-1 text-muted-foreground text-xs">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

// Due date component for deliverables
type DueDateProps = {
  dueDate: string;
  isCompleted: boolean;
  isPastDue: boolean;
};

export function DueDate({ dueDate, isCompleted, isPastDue }: DueDateProps) {
  if (!dueDate || isCompleted) {
    return null;
  }

  return (
    <span
      className={cn(
        "text-muted-foreground text-xs",
        isPastDue && "text-destructive"
      )}
    >
      {dueDate}
    </span>
  );
}
