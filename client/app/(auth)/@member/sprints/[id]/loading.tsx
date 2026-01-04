import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative space-y-8">
      <div className="absolute -bottom-8 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />

      {/* Back button */}
      <Skeleton className="h-10 w-24" />

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

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}
