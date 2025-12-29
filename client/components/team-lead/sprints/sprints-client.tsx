"use client";

import { useMemo, useState } from "react";

import { CreateSprintButton } from "@/components/team-lead/sprints/create-sprint-button";
import {
  FilterChips,
  type FilterKey,
} from "@/components/team-lead/sprints/filter-chips";
import { PhaseSection } from "@/components/team-lead/sprints/phase-section";
import { getSprintStatus } from "@/lib/helpers/sprint";
import type { Sprint, SprintProgress } from "@/lib/types";

type SprintsClientProps = {
  sprints: Sprint[];
  progressById: Record<string, SprintProgress | undefined>;
};

export function SprintsClient({ sprints, progressById }: SprintsClientProps) {
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips onFilterChange={setFilter} selected={filter} />
        <CreateSprintButton />
      </div>

      <PhaseSection
        now={now}
        progressById={progressById}
        sprints={sortedByStartAsc}
      />
    </div>
  );
}
