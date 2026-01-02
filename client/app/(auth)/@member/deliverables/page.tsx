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

import { MemberDeliverablesClient } from "@/components/member/deliverables/client";
import {
  getDeliverables,
  getEvidenceByDeliverable,
  getPhases,
} from "@/lib/data/deliverables";

export const metadata = {
  title: "Deliverables",
  description: "View and manage your deliverable submissions",
};

export default async function MemberDeliverablesPage() {
  const [deliverables, phases] = await Promise.all([
    getDeliverables(),
    getPhases(),
  ]);

  const evidenceEntries = await Promise.all(
    deliverables.map(async (deliverable) => {
      const evidence = await getEvidenceByDeliverable(deliverable.id);
      return [deliverable.id, evidence] as const;
    })
  );

  const evidenceByDeliverableId = Object.fromEntries(evidenceEntries);

  return (
    <MemberDeliverablesClient
      deliverables={deliverables}
      evidenceByDeliverableId={evidenceByDeliverableId}
      phases={phases}
    />
  );
}
