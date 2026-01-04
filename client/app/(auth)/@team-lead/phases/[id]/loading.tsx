import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative space-y-8">
      <div className="absolute -bottom-8 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />

      {/* Back button */}
      <Skeleton className="h-10 w-40 rounded-lg" />

      {/* Title with badges on same line */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          {/* Description */}
          <Skeleton className="mt-2 h-4 w-prose" />
        </div>
        {/* Due Date section on right */}
        <div className="flex gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
      {/* PhaseManager - 3 column grid of phase cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Frame key={`phase-${i}`}>
            <FrameHeader className="flex-row items-center justify-between gap-2">
              <FrameTitle>
                <Skeleton className="h-5 w-32" />
              </FrameTitle>
              <Skeleton className="h-8 w-16" />
            </FrameHeader>
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
