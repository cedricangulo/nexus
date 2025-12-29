import type { ComponentProps, HTMLAttributes } from "react";
import type { DeliverableStatus, TaskStatus, PhaseType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatTitleCase } from "@/lib/helpers";

type StatusType = DeliverableStatus | TaskStatus | PhaseType;

export type StatusBadgeProps = ComponentProps<typeof Badge> & {
  status: StatusType;
};

const getStatusClass = (status: StatusType): string => {
  switch (status) {
    case "COMPLETED":
    case "DONE":
      return "completed";
    case "IN_PROGRESS":
      return "in-progress";
    case "REVIEW":
      return "review";
    case "BLOCKED":
      return "blocked";
    case "TODO":
    case "NOT_STARTED":
      return "not-started";
    case "WATERFALL":
      return "waterfall";
    case "SCRUM":
      return "scrum";
    case "FALL":
      return "fall";
    default:
      return "not-started";
  }
};

export const StatusBadge = ({
  className,
  status,
  ...props
}: StatusBadgeProps) => (
  <Badge
    className={cn("flex items-center gap-1.5", "group", getStatusClass(status), className)}
    variant="secondary"
    {...props}
  >
    <StatusIndicator />
    <StatusLabel>{formatTitleCase(status)}</StatusLabel>
  </Badge>
);

export type StatusIndicatorProps = HTMLAttributes<HTMLSpanElement>;

export const StatusIndicator = ({
  className,
  ...props
}: StatusIndicatorProps) => (
  <span className="relative flex size-2" {...props}>
    <span
      className={cn(
        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
        "group-[.completed]:bg-status-completed",
        "group-[.in-progress]:bg-status-in-progress",
        "group-[.review]:bg-status-review",
        "group-[.blocked]:bg-status-blocked",
        "group-[.not-started]:bg-status-not-started",
        "group-[.waterfall]:bg-phase-waterfall",
        "group-[.scrum]:bg-phase-scrum",
        "group-[.fall]:bg-phase-fall"
      )}
    />
    <span
      className={cn(
        "relative inline-flex size-2 rounded-full",
        "group-[.completed]:bg-status-completed",
        "group-[.in-progress]:bg-status-in-progress",
        "group-[.review]:bg-status-review",
        "group-[.blocked]:bg-status-blocked",
        "group-[.not-started]:bg-status-not-started",
        "group-[.waterfall]:bg-phase-waterfall",
        "group-[.scrum]:bg-phase-scrum",
        "group-[.fall]:bg-phase-fall"
      )}
    />
  </span>
);

export type StatusLabelProps = HTMLAttributes<HTMLSpanElement> & {
  children?: React.ReactNode;
};

export const StatusLabel = ({
  className,
  children,
  ...props
}: StatusLabelProps) => (
  <span className={cn("text-muted-foreground text-xs", className)} {...props}>
    {children}
  </span>
);
