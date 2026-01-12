import Phases, { PhasesPageSeleton } from "@/components/adviser/phases/phases";
import { Suspense } from "react";

export default function PhasesPage() {

  return (
    <Suspense fallback={<PhasesPageSeleton />}>
      <Phases />
    </Suspense>
  )
}
