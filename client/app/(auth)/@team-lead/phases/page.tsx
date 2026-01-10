import { Suspense } from "react";
import { PhaseListSkeleton } from "@/components/layouts/loading";
import Phases from "@/components/shared/phases";

export const metadata = {
  title: "Project Phases",
  description: "Manage project phases and deliverables",
};

export default function PhasesPage() {
  return (
    <Suspense fallback={<PhaseListSkeleton />}>
      <Phases />
    </Suspense>
  );
}
