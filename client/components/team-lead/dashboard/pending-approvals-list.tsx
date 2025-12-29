/**
 * Pending Approvals List
 * Server component that fetches pending approvals and displays them
 */
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { deliverableApi } from "@/lib/api/deliverable";
import type { PendingApproval } from "@/lib/helpers/dashboard-computations";
import { getPendingApprovals } from "@/lib/helpers/dashboard-computations";

type PendingApprovalsListProps = {
  items: PendingApproval[];
};

function PendingApprovalsListDisplay({ items }: PendingApprovalsListProps) {
  if (items.length === 0) {
    return (
      <Frame>
        <FrameHeader className="flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-linear-120 from-phase-waterfall to-phase-waterfall/80 p-2 shadow-sm">
              <CheckCircle2 className="size-4 text-white" />
            </div>
            <FrameTitle className="text-sm">Pending Approvals</FrameTitle>
          </div>
        </FrameHeader>
        <FramePanel>
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-chart-4/10">
              <CheckCircle2 className="h-6 w-6 text-chart-4" />
            </div>
            <p className="mt-4 font-medium text-muted-foreground text-sm">
              No pending approvals
            </p>
            <p className="text-muted-foreground text-xs">
              All deliverables have been reviewed
            </p>
          </div>
        </FramePanel>
      </Frame>
    );
  }

  return (
    <Frame>
      <FrameHeader className="flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-linear-120 from-phase-waterfall to-phase-waterfall/80 p-2 shadow-sm">
            <CheckCircle2 className="size-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <FrameTitle className="text-sm">Pending Approvals</FrameTitle>
            <Badge variant="outline">{items.length}</Badge>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/deliverables">View All</Link>
        </Button>
      </FrameHeader>
      <FramePanel>
        {items.slice(0, 5).map((item) => (
          <React.Fragment key={item.id}>
            <div className="mb-4 flex items-start justify-between gap-2">
              <p className="font-medium text-sm leading-tight group-hover:text-primary">
                {item.title}
              </p>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(item.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </React.Fragment>
        ))}

        {items.length > 5 && (
          <div className="border-border border-t p-3 text-center">
            <Button asChild size="sm" variant="outline">
              <Link href="/deliverables">
                View {items.length - 5} more pending approvals
              </Link>
            </Button>
          </div>
        )}
      </FramePanel>
    </Frame>
  );
}

export async function PendingApprovalsList() {
  const deliverables = await deliverableApi.listDeliverables();
  const pendingApprovals = getPendingApprovals(deliverables);
  const sortedApprovals = [...pendingApprovals].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return <PendingApprovalsListDisplay items={sortedApprovals} />;
}
