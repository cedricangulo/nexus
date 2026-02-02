import { Frame, FrameHeader, FramePanel } from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";

export function PhaseCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Frame>
        <FrameHeader>
          <Skeleton className="h-4 w-24" />
        </FrameHeader>
        <FramePanel className="space-y-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-full rounded-xs" />
        </FramePanel>
      </Frame>
      <Frame>
        <FrameHeader>
          <Skeleton className="h-4 w-24" />
        </FrameHeader>
        <FramePanel className="space-y-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-full rounded-xs" />
        </FramePanel>
      </Frame>
      <Frame>
        <FrameHeader>
          <Skeleton className="h-4 w-24" />
        </FrameHeader>
        <FramePanel className="space-y-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-full rounded-xs" />
        </FramePanel>
      </Frame>
      <Frame>
        <FrameHeader>
          <Skeleton className="h-4 w-24" />
        </FrameHeader>
        <FramePanel className="space-y-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-full rounded-xs" />
        </FramePanel>
      </Frame>
    </div>
  );
}

export function PhaseTimelineSkeleton() {
  return (
    <Frame>
      <FrameHeader>
        <Skeleton className="h-4 w-32" />
      </FrameHeader>
      <FramePanel className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-full" />
        </div>
      </FramePanel>
    </Frame>
  );
}

export function PhaseChartSkeleton() {
  return (
    <Frame>
      <FrameHeader>
        <Skeleton className="h-4 w-40" />
      </FrameHeader>
      <FramePanel className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
        </div>
      </FramePanel>
    </Frame>
  );
}
