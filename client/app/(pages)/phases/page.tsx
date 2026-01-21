import { Suspense } from "react";
import Boundary from "@/components/internal/Boundary";
import { Phases } from "@/features/phases";
import { PhasesPageSeleton } from "@/features/phases/components/dashboard/phases";

export default function PhasesPage() {
  return (
    <Boundary hydration="server" rendering="dynamic">
      <Suspense fallback={<PhasesPageSeleton />}>
        <Phases />
      </Suspense>
    </Boundary>
  );
}
