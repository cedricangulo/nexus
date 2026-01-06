import { Skeleton } from "@/components/ui/skeleton";

export function ActivityLogListSkeleton() {
  return (
    <div className="relative space-y-8">
      <div className="absolute -bottom-8 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-4">
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <Skeleton className="h-4 w-60 rounded-sm" />

      <Skeleton className="h-50 w-full" />
    </div>
  );
}
