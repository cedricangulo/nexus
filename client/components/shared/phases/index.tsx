import { getPhasesWithDetails } from "@/lib/data/phases";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { PhaseManager } from "./phase-manager";

export default async function Phases() {
  const { token } = await getAuthContext();

  const phasesWithDeliverables = await getPhasesWithDetails(token);

  return <PhaseManager phases={phasesWithDeliverables} />;
}
