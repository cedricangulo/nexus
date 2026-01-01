import { auth } from "@/auth";
import { SprintsView } from "@/components/shared/sprints/sprints-view";
import { getSprints, getSprintsProgress } from "@/lib/data/sprint";

export const metadata = {
  title: "My Sprints",
  description: "View and manage sprints assigned to you",
};

export default async function Page() {
  const session = await auth();

  // HARD GATE: Member only
  if (session?.user?.role !== "member") {
    return null;
  }

  // Fetch sprints assigned to the user
  const sprints = await getSprints();

  // Fetch progress for sprints
  const progressById = await getSprintsProgress(sprints.map((s) => s.id));

  return (
    <SprintsView
      progressById={progressById}
      sprints={sprints}
      userRole={session?.user?.role}
    />
  );
}
