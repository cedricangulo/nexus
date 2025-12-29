"use client";

import { useMemo, useState } from "react";

import { PhaseList } from "@/components/shared/sprints/phase-list";
import {
  FilterChips,
  type FilterKey,
} from "@/components/shared/sprints/filter-chips";
import { CreateSprintButton } from "@/components/team-lead/sprints/_components/sprint-actions";
import { getSprintStatus } from "@/lib/helpers/sprint";
import type { Sprint, SprintProgress } from "@/lib/types";

type SprintsViewProps = {
  sprints: Sprint[];
  progressById: Record<string, SprintProgress | undefined>;
  userRole: string;
};

export function SprintsView({
  sprints,
  progressById,
  userRole,
}: SprintsViewProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const now = new Date();

  const filtered = useMemo(
    () =>
      sprints.filter((sprint) => {
        if (filter === "all") {
          return true;
        }
        const status = getSprintStatus(sprint, now);
        if (filter === "active") {
          return status === "ACTIVE";
        }
        if (filter === "planned") {
          return status === "PLANNED";
        }
        return status === "COMPLETED";
      }),
    [filter, sprints, now]
  );

  const sortedByStartAsc = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      ),
    [filtered]
  );

  const isTeamLead = userRole === "teamLead";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips onFilterChange={setFilter} selected={filter} />
        {isTeamLead ? <CreateSprintButton /> : null}
      </div>

      <PhaseList
        now={now}
        progressById={progressById}
        sprints={sortedByStartAsc}
        userRole={userRole}
      />
    </div>
  );
}
