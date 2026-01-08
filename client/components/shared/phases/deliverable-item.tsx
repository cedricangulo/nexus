"use client";

import { StatusBadge } from "@/components/ui/status";
import { formatRelativeDueDate, isDateInPast } from "@/lib/helpers/format-date";
import type { Deliverable } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DeliverableItem({
  deliverables,
}: {
  deliverables: Deliverable[];
}) {
  if (deliverables.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground text-sm">
        No deliverables yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {deliverables.map((item) => (
        <div
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors"
          key={item.id}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground text-sm">
              {item.title}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={item.status} />
              {item.dueDate && item.status !== "COMPLETED" ? (
                <span
                  className={cn(
                    "text-muted-foreground text-xs",
                    isDateInPast(item.dueDate) && "text-destructive"
                  )}
                >
                  {formatRelativeDueDate(item.dueDate)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
