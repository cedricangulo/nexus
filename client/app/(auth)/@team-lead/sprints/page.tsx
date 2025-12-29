import { auth } from "@/auth";
import { SprintsClient } from "@/components/team-lead/sprints/sprints-client";
import { getSprints, getSprintsProgress } from "@/lib/data/sprint";

export default async function Page() {
  const session = await auth();
  if (session?.user?.role !== "teamLead") {
    return null;
  }

  const sprints = await getSprints();
  const progressById = await getSprintsProgress(sprints.map((s) => s.id));

  return <SprintsClient progressById={progressById} sprints={sprints} />;
}
