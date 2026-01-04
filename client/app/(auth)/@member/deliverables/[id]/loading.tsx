import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative space-y-6">
      {/* Gradient fade overlay */}
      <div className="absolute -bottom-6 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />

      {/* Back button and title */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-56" />
      </div>

      {/* Status and meta info */}
      <div className="flex gap-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Main content area */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="space-y-2 rounded-lg border p-4" key={i}>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
