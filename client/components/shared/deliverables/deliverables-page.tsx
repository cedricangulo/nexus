import {
  getDeliverables,
  getEvidenceByDeliverable,
  getPhases,
} from "@/lib/data/deliverables";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { DeliverablesClient } from "./client";

export default async function DeliverablesPage() {
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
