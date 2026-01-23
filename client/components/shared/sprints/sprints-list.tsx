import { FolderXIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SprintCard } from "@/components/shared/sprints/sprint-card";
import { getFilteredSprints, getSprintsProgress, SprintFilters } from "@/lib/data/sprint";
import { User } from "@/lib/types";

type Props = {
  filters: SprintFilters;
  token: string;
  user: User;
};

export async function SprintsList({ filters, token, user }: Props) {

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
