import { Skeleton } from "@/components/ui/skeleton";

export function SprintListSkeleton({ role }: { role?: string }) {
  return (
    <div className="relative space-y-8">
      <div className="absolute -bottom-8 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />

      {/* FilterChips */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton className="h-9 w-24" key={`filter-${i}`} />
          ))}
        </div>
        {role === "teamLead" ? <Skeleton className="h-9 w-40" /> : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, sprintIdx) => (
          <Skeleton className="h-56 rounded-lg" key={`sprint-${sprintIdx}`} />
        ))}
      </div>
    </div>
  );
}
