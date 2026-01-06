/**
 * Deliverables Page Server Component (Team Lead View)
 *
 * This is a server component that handles data fetching and rendering
 * the deliverables management page. It aggregates deliverables, phases,
 * and evidence data, then passes everything to the client component.
 *
 * Data Fetching:
 * - Parallel fetch of deliverables and phases
 * - Individual evidence fetch for each deliverable (handled gracefully)
 * - Evidence aggregated into a map for easy lookup
 *
 * Page Metadata:
 * - Title: "Deliverables"
 * - Description: "Review and manage deliverables and evidence"
 *
 * @route /app/(auth)/@team-lead/deliverables
 * @access Team Lead role only
 */
import { DeliverablesClient } from "@/components/team-lead/deliverables/client";
import {
  getDeliverables,
  getEvidenceByDeliverable,
  getPhases,
} from "@/lib/data/deliverables";
import { getAuthContext } from "@/lib/helpers/auth-token";

export const metadata = {
  title: "Deliverables",
  description: "Review and manage deliverables and evidence",
};

export default async function TeamLeadDeliverablesPage() {
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
    <DeliverablesClient
      deliverables={deliverables}
      evidenceByDeliverableId={evidenceByDeliverableId}
      phases={phases}
    />
  );
}
