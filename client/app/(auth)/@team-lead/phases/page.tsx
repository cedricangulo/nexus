import { PhaseManager } from "@/components/team-lead/phases/phase-manager";
import { getPhasesWithDetails } from "@/lib/data/phases";
import { getAuthContext } from "@/lib/helpers/auth-token";

export const metadata = {
  title: "Project Phases",
  description: "Manage project phases and deliverables",
};

export default async function PhasesPage() {
  const { token } = await getAuthContext();

  const phasesWithDeliverables = await getPhasesWithDetails(token);

  return <PhaseManager isTeamLead phases={phasesWithDeliverables} />;
}
