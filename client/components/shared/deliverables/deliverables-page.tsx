import { Suspense } from "react";
import Boundary from "@/components/internal/Boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliverablesFilters } from "./deliverables-filters";
import { DeliverablesList } from "./deliverables-list";
import { 
  Total, 
  TotalCard, 
  Overdue, 
  OverdueCard, 
  Timeline, 
  TimelineCard 
} from "./summary";

type DeliverablesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function DeliverablesListSkeleton() {
  return (
    <section className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="absolute -bottom-8 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-36.25 w-full rounded-xl opacity-50" />
      ))}
    </section>
  );
}

export default async function DeliverablesPage({ searchParams }: DeliverablesPageProps) {
  return (
    <div className="space-y-8">
      {/* Summary Cards - Each with independent Suspense */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <Boundary hydration="server" rendering="dynamic">
          <TotalCard>
            <Suspense fallback={<Skeleton className="h-9 w-6" />}>
              <Total searchParams={searchParams} />
            </Suspense>
          </TotalCard>
        </Boundary>

        <Boundary hydration="server" rendering="dynamic">
          <OverdueCard>
            <Suspense fallback={<Skeleton className="h-9 w-6" />}>
              <Overdue searchParams={searchParams} />
            </Suspense>
          </OverdueCard>
        </Boundary>

        <Boundary hydration="server" rendering="dynamic">
          <TimelineCard>
            <Suspense fallback={<Skeleton className="h-8 w-full rounded-xs" />}>
              <Timeline searchParams={searchParams} />
            </Suspense>
          </TimelineCard>
        </Boundary>
      </section>

      <Boundary hydration="client" rendering="static">
        <DeliverablesFilters />
      </Boundary>

      {/* Deliverables List */}
      <Suspense fallback={<DeliverablesListSkeleton />}>
        <DeliverablesList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
