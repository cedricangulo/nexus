import { getPhasesWithDetails } from "@/lib/data/phases";
import { PhaseManager } from "./phase-manager";

export default async function Phases() {
  const phasesWithDeliverables = await getPhasesWithDetails();

  return <PhaseManager phases={phasesWithDeliverables} />;
}
