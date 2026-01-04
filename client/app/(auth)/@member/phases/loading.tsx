import { Frame, FramePanel, FrameTitle } from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";

export default function PhasesLoading() {
  return (
    <div className="relative space-y-8">
      <div className="absolute -bottom-8 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />

      {/* PhaseManager - 3 column grid of phase cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Frame key={`phase-${i}`}>
            <FrameTitle>
              <Skeleton className="h-5 w-32" />
            </FrameTitle>
            <FramePanel className="space-y-2 p-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </FramePanel>
          </Frame>
        ))}
      </div>
    </div>
  );
}
