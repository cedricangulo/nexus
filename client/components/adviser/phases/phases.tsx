import { Suspense } from "react";
import Boundary from "@/components/internal/Boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { getPhases } from "@/lib/data/phases";
import EmptyPhases from "./empty-phases";
import PhaseCard, { HeaderSkeleton } from "./phase-card";
import PhaseProgressDisplay from "./phase-progress-display";
import { Frame, FrameHeader, FramePanel } from "@/components/ui/frame";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { cacheTag } from "next/cache";

export default async function Phases() {
  // Fetch token HERE (Dynamic Layer)
  const { user, token } = await getAuthContext();

  // Pass token DOWN (Cache Layer)
  return <CachedPhasesView userId={user.id} token={token} />;
}

// Accepts token as prop so it doesn't need to check cookies()
async function CachedPhasesView({ userId, token }: { userId: string; token: string }) {
  "use cache";
  cacheTag("phases-list", `user-${userId}`);

  // Use the passed token!
  const phases = await getPhases(token);

  const phaseOrder = ["WATERFALL", "SCRUM", "FALL"];
  const sortedPhases = [...phases].sort(
    (a, b) => phaseOrder.indexOf(a.type) - phaseOrder.indexOf(b.type)
  );

  if (sortedPhases.length === 0) {
    return <EmptyPhases />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {sortedPhases.map((phase) => (
        <Boundary hydration="server" key={phase.id} rendering="dynamic">
          <PhaseCard phase={phase}>
            {/* The analytics inside still stream in independently! */}
            <Suspense fallback={<ProgressSkeleton />}>
              <PhaseProgressDisplay phaseId={phase.id} token={token} />
            </Suspense>
          </PhaseCard>
        </Boundary>
      ))}
    </div>
  );
}

function ProgressSkeleton() {
	return (
		<>
			<FramePanel className="space-y-3">
				<Skeleton className="h-3.5 w-12" />
				<Skeleton className="h-2 w-full" />
			</FramePanel>
			<FramePanel className="space-y-3">
				<Skeleton className="h-3.5 w-12" />
				<Skeleton className="h-2 w-full" />
			</FramePanel>
			<FramePanel className="flex items-center justify-between">
				<Skeleton className="h-3.5 w-12" />
				<Skeleton className="h-7 w-4" />
			</FramePanel>
		</>
	);
}

export function PhasesPageSeleton() {
  return (
    <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      <div className="absolute -bottom-6 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />
      {[1, 2, 3].map((idx) => (
        <Frame key={idx} stackedPanels>
          <FrameHeader className="p-4">
            <HeaderSkeleton />
          </FrameHeader>
          <ProgressSkeleton />
        </Frame>
      ))}
    </div>
  )
}
