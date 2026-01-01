"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status";
import type { DeliverableStatus, TaskStatus } from "@/lib/types";
import { cn, getInitials } from "@/lib/utils";

type PhaseItemCardContent = {
  title: string;
  status: TaskStatus | DeliverableStatus;
  description?: string | null;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

type PhaseItemCardHandlers = {
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

type PhaseItemCardConfig = {
  isTeamLead?: boolean;
  className?: string;
};

type PhaseItemCardProps = PhaseItemCardContent &
  PhaseItemCardHandlers &
  PhaseItemCardConfig;

export function PhaseItemCard({
  title,
  status,
  description,
  onClick,
  onEdit,
  onDelete,
  isTeamLead = false,
  className,
  children,
  footer,
}: PhaseItemCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-2",
        "transition-colors hover:bg-muted/50",
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
        {Boolean(isTeamLead && onEdit && onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
                size="icon"
                variant="ghost"
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                variant="destructive"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {description ? (
        <p className="line-clamp-2 text-muted-foreground text-xs">
          {description}
        </p>
      ) : null}

      {footer ? <div className="mt-1">{footer}</div> : null}
    </div>
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
