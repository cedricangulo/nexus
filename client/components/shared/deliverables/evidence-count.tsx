import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getEvidenceCount } from "@/lib/data/deliverables";
import { getAuthContext } from "@/lib/helpers/auth-token";

type EvidenceCountProps = {
  deliverableId: string;
};

async function EvidenceCountData({ deliverableId }: EvidenceCountProps) {
  const { token } = await getAuthContext();
  const count = await getEvidenceCount(deliverableId, token);

  return (
    <Badge className="shrink-0" variant="secondary">
      {count} {count === 1 ? "file" : "files"}
    </Badge>
  );
}

function EvidenceCountSkeleton() {
  return <Skeleton className="h-5 w-16" />;
}

export function EvidenceCount({ deliverableId }: EvidenceCountProps) {
  return (
    <Suspense fallback={<EvidenceCountSkeleton />}>
      <EvidenceCountData deliverableId={deliverableId} />
    </Suspense>
  );
}
