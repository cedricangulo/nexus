import { SprintsView } from "@/components/shared/sprints/sprints-view";
import { getSprints, getSprintsProgress } from "@/lib/data/sprint";

export default async function Page() {
  // Auth and role validation handled by parent layout
  const sprints = await getSprints();
  const progressById = await getSprintsProgress(sprints.map((s) => s.id));

  return (
    <SprintsView
      progressById={progressById}
      sprints={sprints}
      userRole="teamLead"
    />
  );
}
