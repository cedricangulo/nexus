/**
 * Deliverables Client Component (Team Lead View)
 *
 * Interactive React component for managing deliverables in the team lead dashboard.
 * Provides features for:
 * - Viewing deliverables with filtering and sorting
 * - Navigating to detail page for approving and requesting changes
 * - Viewing evidence history
 *
 * Navigates to /deliverables/[id] for detail view instead of using modal.
 *
 * Permissions:
 * - Can approve deliverables with status=REVIEW
 * - Can request changes and add feedback comments
 * - Can view all uploaded evidence files
 */
"use client";

import { FolderX } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DeliverableCard,
  DeliverablesFilters,
  DeliverablesSummaryCards,
} from "@/components/shared/deliverables";
import { EmptyState } from "@/components/shared/empty-state";
import type { Deliverable, Evidence, Phase } from "@/lib/types";
import type { PhaseFilter, StatusFilter } from "@/lib/types/deliverables-types";
import { getDeliverablesSummary } from "../../../hooks/get-deliverables-summary";
import { getFilteredDeliverables } from "../../../hooks/get-filtered-deliverables";

/**
 * Props for the DeliverablesClient component
 * @property deliverables - Array of all deliverables
 * @property phases - Array of project phases for filtering
 * @property evidenceByDeliverableId - Map of deliverable IDs to their evidence arrays
 */
type DeliverablesClientProps = {
  deliverables: Deliverable[];
  phases: Phase[];
  evidenceByDeliverableId: Record<string, Evidence[]>;
};

export function DeliverablesClient({
  deliverables,
  phases,
  evidenceByDeliverableId,
}: DeliverablesClientProps) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [query, setQuery] = useState("");

  const phaseById = useMemo(
    () => Object.fromEntries(phases.map((phase) => [phase.id, phase] as const)),
    [phases]
  );

  const summary = useMemo(
    () => getDeliverablesSummary(deliverables),
    [deliverables]
  );

  const filtered = useMemo(
    () =>
      getFilteredDeliverables({
        deliverables,
        phaseFilter,
        query,
        statusFilter,
      }),
    [deliverables, phaseFilter, query, statusFilter]
  );

  return (
    <div className="space-y-8">
      <DeliverablesSummaryCards deliverables={deliverables} summary={summary} />

      <DeliverablesFilters
        onPhaseFilterChange={setPhaseFilter}
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
        phaseFilter={phaseFilter}
        phases={phases}
        query={query}
        statusFilter={statusFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState
          description="Try adjusting your filters or search query."
          icon={FolderX}
          title="No Deliverables Found"
        />
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((deliverable) => {
            const phase = phaseById[deliverable.phaseId];
            const evidence = evidenceByDeliverableId[deliverable.id] ?? [];
            return (
              <DeliverableCard
                deliverable={deliverable}
                evidenceCount={evidence.length}
                key={deliverable.id}
                phase={phase}
              />
            );
          })}
        </section>
      )}
    </div>
  );
}
