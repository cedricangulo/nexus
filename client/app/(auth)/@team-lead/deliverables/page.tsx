import { Suspense } from "react";
import { DeliverableListSkeleton } from "@/components/layouts/loading";
import TeamLeadDeliverablesPage from "@/components/team-lead/deliverables";

export default async function Page() {
  // Auth and role validation handled by parent layout
  return (
    <Suspense fallback={<DeliverableListSkeleton />}>
      <TeamLeadDeliverablesPage />
    </Suspense>
  );
}
