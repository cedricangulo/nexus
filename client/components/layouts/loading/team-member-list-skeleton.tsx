import { Skeleton } from "@/components/ui/skeleton";

export function TeamMemberListSkeleton() {
  return (
    <div className="relative space-y-4">
      <div className="absolute -bottom-6 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-10 w-full max-w-60" />
        <Skeleton className="h-10 w-32" />
      </div>
      {/* table */}
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
