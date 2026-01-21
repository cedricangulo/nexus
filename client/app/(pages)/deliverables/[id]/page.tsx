import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status";
import {
  Evidence,
  HeaderButtons,
  UploadEvidenceButton,
} from "@/features/deliverables";
import CommentSection from "@/features/deliverables/components/comment-section";
import { getDeliverableDetail } from "@/features/deliverables/data/deliverables";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { formatDate } from "@/lib/helpers/format-date";
import { isDeliverableOverdue } from "@/lib/types/deliverables-utils";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const { user, token } = await getAuthContext();

  const { deliverable, phase } = await getDeliverableDetail(id, token);

  if (!(deliverable && user)) {
    notFound();
  }

  const overdue = isDeliverableOverdue(deliverable);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="icon" variant="outline">
              <Link href="/deliverables">
                <ChevronLeftIcon />
              </Link>
            </Button>
            <h1 className="font-semibold text-2xl">{deliverable.title}</h1>
          </div>
          <p className="max-w-prose text-muted-foreground">
            {deliverable.description}
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-4 divide-x text-muted-foreground text-sm">
            <p className="pr-4">{phase?.name || "No phase assigned"}</p>
            {/* Hide if the deliverable is completed */}
            {deliverable.status !== "COMPLETED" ? (
              <div
                className={cn(
                  "flex items-center gap-2 pr-4 text-sm",
                  overdue ? "text-destructive" : null
                )}
              >
                <p className="font-semibold text-sm">Due</p>
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
                ) : (
                  <span>No Date Yet</span>
                )}
              </div>
            ) : null}
            <div className="pr-4">
              {phase ? <StatusBadge status={phase.type} /> : null}
            </div>
            <div>
              <StatusBadge status={deliverable.status} />
            </div>
          </div>
          <HeaderButtons
            id={deliverable.id}
            status={deliverable.status}
            title={deliverable.title}
          />
          <UploadEvidenceButton
            id={deliverable.id}
            status={deliverable.status}
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Evidence deliverable={deliverable} token={token} />
        <div className="space-y-2 lg:col-span-7">
          <CommentSection id={deliverable.id} />
        </div>
      </div>
    </div>
  );
}
