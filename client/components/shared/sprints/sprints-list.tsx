import { FolderXIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SprintCard } from "@/components/shared/sprints/sprint-card";
import { getFilteredSprints, getSprintsProgress } from "@/lib/data/sprint";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { sprintSearchParamsCache } from "@/lib/types/search-params";

type SprintsListProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export async function SprintsList({ searchParams }: SprintsListProps) {
  const { user, token } = await getAuthContext();
  const filters = sprintSearchParamsCache.parse(searchParams);

  const sprints = await getFilteredSprints(token, user.role, filters);
  const progressById = await getSprintsProgress(
    sprints.map((s) => s.id),
    token
  );

  const isTeamLead = user.role === "TEAM_LEAD";

  if (sprints.length === 0) {
    return (
      <EmptyState
        description="There are no sprints in this status yet."
        icon={FolderXIcon}
        title="No sprints available"
      />
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {sprints.map((sprint) => (
        <SprintCard
          isTeamLead={isTeamLead}
          key={sprint.id}
          progress={progressById[sprint.id]}
          sprint={sprint}
        />
      ))}
    </section>
  );
}
