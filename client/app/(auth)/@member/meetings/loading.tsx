import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";

export default function MeetingsLoading() {
  return (
    <div className="relative space-y-8">
      <div className="absolute -bottom-8 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />

      {/* SummaryCardsRow (3-4 cards) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Frame key={`summary-${i}`}>
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
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-full flex-wrap items-center gap-4 md:w-fit">
          <Skeleton className="h-9 w-full md:w-80" />
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton className="h-9 w-full md:w-20" key={`chip-${i}`} />
          ))}
        </div>
        <Skeleton className="h-9 w-full md:w-20" />
      </div>

      <div className="overflow-hidden rounded-md border bg-background">
        <div className="flex justify-between gap-4 border-b">
          <div className="w-full p-4">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="w-full border-l p-4">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="w-full border-l p-4">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="w-full border-l p-4">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="w-full border-l p-4">
            {/* <Skeleton className="w-16 h-4" /> */}
          </div>
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton className="h-6 w-full" key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
