import { Calendar } from "lucide-react";
import Link from "next/link";
import {
  FrameDescription,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { StatusBadge } from "@/components/ui/status";
import { formatDate } from "@/lib/helpers/format-date";
import type { Deliverable, Phase } from "@/lib/types";
import { isDeliverableOverdue } from "@/lib/types/deliverables-utils";
import { cn } from "@/lib/utils";
import { EvidenceCount } from "./evidence-count";

export type DeliverableItemProps = {
  deliverable: Deliverable;
  phase?: Phase;
};

export function DeliverableItem({
  deliverable,
  phase,
}: DeliverableItemProps) {
  const overdue = isDeliverableOverdue(deliverable);

  return (
    <Link href={`/deliverables/${deliverable.id}`}>
      <FramePanel className="space-y-4 bg-card transition-colors hover:bg-card/60">
        <div className="space-y-0">
          <FrameTitle className="w-full truncate font-semibold text-base">
            {deliverable.title}
          </FrameTitle>
          <FrameDescription>
            {phase ? (
              <span className="truncate text-muted-foreground text-sm">
                {phase.name}
              </span>
            ) : null}
          </FrameDescription>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={deliverable.status} />
            {phase ? <StatusBadge status={phase.type} /> : null}
          </div>

          <div className="flex items-start justify-between">
            {deliverable.dueDate ? (
              <div
                className={cn(
                  "flex items-center gap-2 text-sm [&_svg]:text-muted-foreground",
                  overdue ? "text-destructive" : null
                )}
              >
                <Calendar size={16} />
                <span>
                  Due{" "}
                  <span className={cn(overdue ? "font-semibold" : null)}>
                    {formatDate(deliverable.dueDate)}
                  </span>
                </span>
              </div>
            ) : null}
            <EvidenceCount deliverableId={deliverable.id} />
          </div>
        </div>
      </FramePanel>
    </Link>
  );
}
