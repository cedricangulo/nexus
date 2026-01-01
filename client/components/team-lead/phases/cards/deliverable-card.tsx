"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/status";
import { formatRelativeDueDate, isDateInPast } from "@/lib/helpers/format-date";
import type { Deliverable } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DueDate } from "./phase-item-card";

type DeliverableCardProps = {
  deliverable: Deliverable;
};

export function DeliverableCard({ deliverable }: DeliverableCardProps) {
  const isPastDue =
    deliverable.dueDate &&
    isDateInPast(deliverable.dueDate) &&
    deliverable.status !== "COMPLETED";

  const formattedDueDate = deliverable.dueDate
    ? formatRelativeDueDate(deliverable.dueDate)
    : "";

  return (
    <Link
      className={cn(
        "block space-y-2 rounded-lg border border-border bg-muted/30 p-2",
        "transition-colors hover:bg-muted/50"
      )}
      href={`/deliverables/${deliverable.id}`}
    >
      <div className="flex items-center gap-2">
        <StatusBadge status={deliverable.status} />
        <DueDate
          dueDate={formattedDueDate}
          isCompleted={deliverable.status === "COMPLETED"}
          isPastDue={!!isPastDue}
        />
      </div>
      <h4 className="font-medium text-sm leading-tight">{deliverable.title}</h4>
    </Link>
  );
}
