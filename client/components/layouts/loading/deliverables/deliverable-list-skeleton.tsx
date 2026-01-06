import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";

export function DeliverableListSkeleton() {
  return (
    <div className="relative space-y-8">
      <div className="absolute -bottom-8 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Frame>
          <FrameHeader className="flex-row items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <FrameTitle>
              <Skeleton className="h-5 w-32" />
            </FrameTitle>
          </FrameHeader>
          <FramePanel className="space-y-2">
            <Skeleton className="h-6 w-4" />
          </FramePanel>
        </Frame>
        <Frame>
          <FrameHeader className="flex-row items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <FrameTitle>
              <Skeleton className="h-5 w-32" />
            </FrameTitle>
          </FrameHeader>
          <FramePanel className="space-y-2">
            <Skeleton className="h-6 w-4" />
          </FramePanel>
        </Frame>
        <Frame>
          <FrameHeader className="flex-row items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <FrameTitle>
              <Skeleton className="h-5 w-32" />
            </FrameTitle>
          </FrameHeader>
          <FramePanel className="flex gap-1">
            <Skeleton className="h-6 w-full rounded-xs" />
            <Skeleton className="h-6 w-full rounded-xs" />
            <Skeleton className="h-6 w-full rounded-xs" />
            <Skeleton className="h-6 w-full rounded-xs" />
            <Skeleton className="h-6 w-full rounded-xs" />
            <Skeleton className="h-6 w-full rounded-xs" />
            <Skeleton className="h-6 w-full rounded-xs" />
            <Skeleton className="h-6 w-full rounded-xs" />
          </FramePanel>
        </Frame>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-80" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton className="h-9 w-20" key={`chip-${i}`} />
          ))}
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton className="h-36 rounded-lg" key={`card-${i}`} />
        ))}
      </section>
    </div>
  );
}
