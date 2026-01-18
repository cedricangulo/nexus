import { Suspense } from "react";
import { SprintsFilters } from "@/components/shared/sprints/sprints-filters";
import { SprintsList } from "@/components/shared/sprints/sprints-list";
import { Active, Total, Upcoming } from "@/components/shared/sprints/summary";
import { Skeleton } from "@/components/ui/skeleton";
import { ActiveCard } from "@/components/shared/sprints/summary/active";
import { TotalCard } from "@/components/shared/sprints/summary/total";
import { UpcomingCard } from "@/components/shared/sprints/summary/upcoming";
import { MobileSummary, SUMMARY_ITEMS, SummaryCardItem } from "@/components/shared/sprints/summary/mobile-summary";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <MobileSummary>
        {SUMMARY_ITEMS.map(({ label, Component, colorClass }) => (
          <SummaryCardItem
            key={label}
            label={label}
            Component={Component}
            colorClass={colorClass}
            searchParams={params}
          />
        ))}
      </MobileSummary>
      {/* <SummaryCard searchParams={params} /> */}
      <div className="hidden sm:grid grid-cols-2 gap-4 sm:grid-cols-3">
        <TotalCard>
          <Suspense fallback={<Skeleton className="h-9 w-6" />}>
            <Total searchParams={params} />
          </Suspense>
        </TotalCard>
        <ActiveCard>
          <Suspense fallback={<Skeleton className="h-9 w-6" />}>
            <Active searchParams={params} />
          </Suspense>
        </ActiveCard>
        <UpcomingCard>
          <Suspense fallback={<Skeleton className="h-9 w-6" />}>
            <Upcoming searchParams={params} />
          </Suspense>
        </UpcomingCard>
      </div>

      {/* Filters */}
      <SprintsFilters />

      {/* Sprint List */}
      <Suspense fallback={<SprintListSkeleton />}>
        <SprintsList searchParams={params} />
      </Suspense>
    </div>
  );
}

function SprintListSkeleton() {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((key) => (<Skeleton key={key} className="h-54.5 w-full" />))}
    </section>
  )
}
