import { PhaseManager } from "@/components/team-lead/phases/phase-manager";
import { getPhasesWithDetails } from "@/lib/data/phases";

export const metadata = {
  title: "Project Phases",
  description: "Manage project phases and deliverables",
};

export default async function PhasesPage() {
  // Auth and role validation handled by parent layout
  const phasesWithDeliverables = await getPhasesWithDetails();

  return <PhaseManager isTeamLead phases={phasesWithDeliverables} />;
}
