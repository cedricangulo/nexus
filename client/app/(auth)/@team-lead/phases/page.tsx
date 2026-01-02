import { auth } from "@/auth";
import { PhaseManager } from "@/components/team-lead/phases/phase-manager";
import { getPhasesWithDetails } from "@/lib/data/phases";

export const metadata = {
  title: "Project Phases",
  description: "Manage project phases and deliverables",
};

export default async function PhasesPage() {
  const session = await auth();

  // HARD GATE: Team Lead only
  if (session?.user?.role !== "teamLead") {
    return null;
  }

  const phasesWithDeliverables = await getPhasesWithDetails();

  return <PhaseManager isTeamLead phases={phasesWithDeliverables} />;
}
