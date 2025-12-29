import { auth } from "@/auth";
import { SprintsView } from "@/components/shared/sprints/sprints-view";
import { getSprints, getSprintsProgress } from "@/lib/data/sprint";

export default async function Page() {
  const session = await auth();
  if (session?.user?.role !== "teamLead") {
    return null;
  }

  const sprints = await getSprints();
  const progressById = await getSprintsProgress(sprints.map((s) => s.id));

  return (
    <SprintsView
      progressById={progressById}
      sprints={sprints}
      userRole={session?.user?.role}
    />
  );
}
