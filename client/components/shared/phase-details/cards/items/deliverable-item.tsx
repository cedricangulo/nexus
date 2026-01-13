import { FramePanel } from "@/components/ui/frame";
import { StatusBadge } from "@/components/ui/status";
import { formatRelativeDueDate, isDateInPast } from "@/lib/helpers/format-date";
import type { Deliverable } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  deliverable: Deliverable;
  children?: React.ReactNode;
};

export function DeliverableItem({ deliverable, children }: Props) {
  return (
    <FramePanel className="flex justify-between items-start">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={deliverable.status} />
          {deliverable.dueDate && deliverable.status !== "COMPLETED" ? (
            <span
              className={cn(
                "text-muted-foreground text-xs",
                isDateInPast(deliverable.dueDate) && "text-destructive"
              )}
            >
              {formatRelativeDueDate(deliverable.dueDate)}
            </span>
          ) : null}
        </div>
        <p className="truncate font-medium text-foreground text-sm">
          {deliverable.title}
        </p>
      </div>
      {children}
    </FramePanel>
  );
}
