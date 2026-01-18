import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status";
import { getPhaseHeader } from "@/lib/data/phases";
import { formatDate } from "@/lib/helpers/format-date";
import type { Phase } from "@/lib/types/models";

type Props = {
  phaseId: string;
};

type PhaseHeaderData = {
  id: string;
  name: string;
  type: Phase["type"];
  description: string | null | undefined;
  startDate: string | null | undefined;
  endDate: string | null | undefined;
};

/**
 * CONTAINER (Dynamic)
 * Fetches phase header using cookies internally.
 * Cannot use "use cache" because getPhaseHeader accesses dynamic data.
 */
export default async function PageHeaderContainer({ phaseId }: Props) {
  const phase = await getPhaseHeader(phaseId);

  if (!phase) return null;

  return <CachedHeaderUI phase={phase} />;
}

/**
 * PRESENTER (Static Shell)
 * Receives phase data as props, safe to cache.
 */
async function CachedHeaderUI({ phase }: { phase: PhaseHeaderData }) {
  "use cache";

  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild size="icon" variant="outline">
            <Link href="/phases">
              <ChevronLeftIcon />
            </Link>
          </Button>
          <h1 className="font-semibold text-2xl">{phase.name}</h1>
          <StatusBadge status={phase.type} />
        </div>
        {phase.description ? (
          <p className="text-muted-foreground">{phase.description}</p>
        ) : null}
      </div>

      <div className="flex gap-4 divide-x divide-border text-sm">
        {phase.startDate ? (
          <div className="space-x-2 pr-4">
            <span className="text-muted-foreground text-sm">Start</span>
            <span className="font-medium">{formatDate(phase.startDate)}</span>
          </div>
        ) : null}
        {phase.endDate ? (
          <div className="space-x-2">
            <span className="text-muted-foreground text-sm">End</span>
            <span className="font-medium">{formatDate(phase.endDate)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
