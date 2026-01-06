import axios from "axios";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PhaseDetailSkeleton } from "@/components/layouts/loading";
import { PhaseDetailContent } from "@/components/team-lead/phases/phase-detail-content";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status";
import { getPhaseById } from "@/lib/data/phases";
import { getAllUsersForDisplay } from "@/lib/data/team";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { formatDate } from "@/lib/helpers/format-date";

async function PhaseContent({ phaseId }: { phaseId: string }) {
  const { token } = await getAuthContext();

  let phase, users;

  try {
    [phase, users] = await Promise.all([
      getPhaseById(phaseId, token),
      getAllUsersForDisplay(token),
    ]);
  } catch (error: unknown) {
    console.error("[PhaseContent] Error fetching phase:", error);
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }
    throw error;
  }

  if (!phase) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost">
        <Link href="/phases">
          <ChevronLeftIcon />
          Back to Phases
        </Link>
      </Button>

      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-semibold text-2xl">{phase.name}</h1>
            <StatusBadge status={phase.type} />
          </div>
          {phase.description && (
            <p className="text-muted-foreground">{phase.description}</p>
          )}
        </div>

        <div className="flex gap-4 text-sm">
          {phase.startDate && (
            <div>
              <p className="text-muted-foreground text-sm">Start Date</p>
              <p className="font-medium">{formatDate(phase.startDate)}</p>
            </div>
          )}
          {phase.endDate && (
            <div>
              <p className="text-muted-foreground text-sm">End Date</p>
              <p className="font-medium">{formatDate(phase.endDate)}</p>
            </div>
          )}
        </div>
      </div>

      <PhaseDetailContent isTeamLead phase={phase} users={users} />
    </div>
  );
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeamLeadPhaseDetailPage({ params }: PageProps) {
  // Auth and role validation handled by parent layout
  const { id } = await params;

  return (
    <Suspense fallback={<PhaseDetailSkeleton />}>
      <PhaseContent phaseId={id} />
    </Suspense>
  );
}
