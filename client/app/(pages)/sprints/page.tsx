import { Suspense } from "react";
import { SprintListSkeleton } from "@/components/layouts/loading";
import { SprintsView } from "@/components/shared/sprints/sprints-view";
import { getSprints, getSprintsProgress } from "@/lib/data/sprint";
import { getAuthContext } from "@/lib/helpers/auth-token";

async function SprintsContent() {
  const { user, token } = await getAuthContext();
  const sprints = await getSprints(token, user.role);
  const progressById = await getSprintsProgress(
    sprints.map((s) => s.id),
    token
  );

  return (
    <SprintsView
      progressById={progressById}
      sprints={sprints}
      userRole="teamLead"
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SprintListSkeleton />}>
      <SprintsContent />
    </Suspense>
  );
}
