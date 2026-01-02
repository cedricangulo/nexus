import { FolderX } from "lucide-react";
import { MemberPhaseCard } from "@/components/member/phases/member-phase-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getPhasesWithDetails } from "@/lib/data/phases";

export const metadata = {
  title: "Project Phases",
  description: "View project phases and deliverables",
};

export default async function PhasesPage() {
  const phasesWithDeliverables = await getPhasesWithDetails();

  if (phasesWithDeliverables.length === 0) {
    return (
      <EmptyState
        description="No phases have been created yet. Please wait for the team lead to set up the project."
        icon={FolderX}
        title="No Phases Available"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {phasesWithDeliverables.map((phase) => (
        <MemberPhaseCard key={phase.id} phase={phase} />
      ))}
    </div>
  );
}
