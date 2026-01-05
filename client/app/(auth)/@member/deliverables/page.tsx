/**
 * Member Deliverables Page
 *
 * Server component for team members to view deliverables.
 * Members can see deliverables for their assigned phases and projects,
 * but cannot approve or request changes (Team Lead only functions).
 *
 * Data Fetching:
 * - Fetch all deliverables
 * - Fetch all phases for reference
 * - Fetch evidence for each deliverable
 *
 * @route /app/(auth)/@member/deliverables
 * @access Member role only
 */

import { Suspense } from "react";
import { DeliverableListSkeleton } from "@/components/layouts/loading";
import { MemberDeliverablesClient } from "@/components/member/deliverables/client";
import {
  getDeliverables,
  getEvidenceByDeliverable,
  getPhases,
} from "@/lib/data/deliverables";
import { getAuthContext } from "@/lib/helpers/auth-token";

export const metadata = {
  title: "Deliverables",
  description: "View and manage your deliverable submissions",
};

export default async function MemberDeliverablesPage() {
  const { token } = await getAuthContext();
  const [deliverables, phases] = await Promise.all([
    getDeliverables(token),
    getPhases(token),
  ]);

  const evidenceEntries = await Promise.all(
    deliverables.map(async (deliverable) => {
      const evidence = await getEvidenceByDeliverable(deliverable.id, token);
      return [deliverable.id, evidence] as const;
    })
  );

  const evidenceByDeliverableId = Object.fromEntries(evidenceEntries);

  return (
    <Suspense fallback={<DeliverableListSkeleton />}>
      <MemberDeliverablesClient
        deliverables={deliverables}
        evidenceByDeliverableId={evidenceByDeliverableId}
        phases={phases}
      />
    </Suspense>
  );
}

