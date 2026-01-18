import Boundary from "@/components/internal/Boundary";
import Phases, { PhasesPageSeleton } from "@/components/shared/phases/phases";
import { Suspense } from "react";

export default function PhasesPage() {

  return (
    <Boundary hydration="server" rendering="dynamic">
      <Suspense fallback={<PhasesPageSeleton />}>
        <Phases />
      </Suspense>
    </Boundary>
  )
}
