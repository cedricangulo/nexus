import { Suspense } from "react";
import { PhaseListSkeleton } from "@/components/layouts/loading";
import { MemberPhaseCard } from "@/components/member/phases/member-phase-card";
import { getPhasesWithDetails } from "@/lib/data/phases";
import { getAuthContext } from "@/lib/helpers/auth-token";

export const metadata = {
  title: "Project Phases",
  description: "View project phases and deliverables",
};

export default async function PhasesPage() {
  const { token } = await getAuthContext();

  // Await the cached data directly - instant when cached, no Suspense needed
  const phasesWithDeliverables = await getPhasesWithDetails(token);

  return (
    <Suspense fallback={<PhaseListSkeleton />}>
      <MemberPhaseCard phase={phasesWithDeliverables} />
    </Suspense>
  );
}
