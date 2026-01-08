import { Calendar, ChevronLeftIcon, FileIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status";
import { formatDate, formatRelativeTime } from "@/lib/helpers/format-date";
import type { Deliverable, Evidence, Phase } from "@/lib/types";
import { DeliverableStatus } from "@/lib/types";
import { isDeliverableOverdue } from "@/lib/types/deliverables-utils";
import { cn } from "@/lib/utils";
import { EmptyState } from "../../empty-state";

type DeliverableDetailsProps = {
  deliverable: Deliverable;
  phase?: Phase;
  evidence: Evidence[];
  controls: { isPending: boolean; canReview: boolean };
  onApprove?: () => void;
  onRequestChanges?: () => void;
  uploadButton?: React.ReactNode;
  commentSection: React.ReactNode;
};

export function DeliverableDetails({
  deliverable,
  phase,
  evidence,
  controls,
  onApprove,
  onRequestChanges,
  uploadButton,
  commentSection,
}: DeliverableDetailsProps) {
  const overdue = isDeliverableOverdue(deliverable);
  const showReviewActions =
    controls.canReview && deliverable.status === DeliverableStatus.REVIEW;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost">
          <Link href="/deliverables">
            <ChevronLeftIcon />
            Back to Deliverables
          </Link>
        </Button>
        {showReviewActions ? (
          <div className="flex flex-col gap-4 sm:flex-row">
            {onRequestChanges ? (
              <Button
                className="w-fit"
                disabled={controls.isPending}
                onClick={onRequestChanges}
                variant="outline"
              >
                Request Changes
              </Button>
            ) : null}
            {onApprove ? (
              <Button
                className="w-fit"
                disabled={controls.isPending}
                onClick={onApprove}
              >
                Approve
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-semibold text-2xl">{deliverable.title}</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">
                {phase?.name || "No phase assigned"}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={deliverable.status} />
                {phase ? <StatusBadge status={phase.type} /> : null}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground text-sm">Due Date</p>
            <div
              className={cn(
                "flex items-center gap-2 text-sm",
                overdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Calendar size={16} />
              {deliverable.dueDate ? (
                <span>
                  {overdue ? "Overdue: " : ""}
                  <span
                    className={cn(
                      overdue ? "font-semibold" : "text-foreground"
                    )}
                  >
                    {formatDate(deliverable.dueDate)}
                  </span>
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <p className="max-w-prose text-muted-foreground">
          {deliverable.description}
        </p>
      </div>

      <Separator />

      <div className="mb-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm">
              Evidence Files
            </h3>
            {uploadButton}
          </div>
          {evidence.length === 0 ? (
            <EmptyState
              description=""
              icon={FileIcon}
              title="No evidence uploaded yet."
            />
          ) : (
            <div className="space-y-2">
              {evidence.map((item) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2"
                  key={item.id}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">
                      {item.fileName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Uploaded {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={item.fileUrl} rel="noreferrer" target="_blank">
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2 lg:col-span-7">{commentSection}</div>
      </div>
    </div>
  );
}
