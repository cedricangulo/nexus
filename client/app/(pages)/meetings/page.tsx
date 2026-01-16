import { Suspense } from "react";
import Boundary from "@/components/internal/Boundary";
import {
  TotalMeetings,
  TotalMeetingsCard,
  Coverage,
  CoverageCard,
  OnTime,
  OnTimeCard,
  MissingMeetings,
  MissingMeetingsCard,
  MobileSummary,
  SUMMARY_ITEMS,
  SummaryCardItem,
} from "@/components/shared/meetings/summary";
import { MeetingsFilters } from "@/components/shared/meetings/table/filter";
import { MeetingsList } from "@/components/shared/meetings/meetings-list";
import { getFilteredMeetingsData } from "@/lib/data/meetings";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { meetingSearchParamsCache } from "@/lib/types/search-params";
import { Skeleton } from "@/components/ui/skeleton";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Meetings Filters Server Component
 * Fetches necessary data for filters
 */
async function MeetingsFiltersData({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { token } = await getAuthContext();
  const filters = meetingSearchParamsCache.parse(searchParams);
  const { sprints, phases, scopeCounts } = await getFilteredMeetingsData(
    token,
    filters
  );

  return (
    <MeetingsFilters
      phases={phases}
      scopeCounts={scopeCounts}
      sprints={sprints}
    />
  );
}

export default async function TeamLeadMeetingsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-8 pb-16">
      {/* Mobile Summary Card */}
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

      {/* Desktop Summary Cards - Each with independent Suspense */}
      <section className="hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        <Boundary hydration="server" rendering="dynamic">
          <TotalMeetingsCard>
            <Suspense fallback={<Skeleton className="h-9 w-6" />}>
              <TotalMeetings searchParams={params} />
            </Suspense>
          </TotalMeetingsCard>
        </Boundary>

        <Boundary hydration="server" rendering="dynamic">
          <CoverageCard>
            <Suspense
              fallback={
                <div className="flex items-center gap-4">
                  <Skeleton className="h-9 w-16" />
                  <div className="w-full space-y-2">
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              }
            >
              <Coverage searchParams={params} />
            </Suspense>
          </CoverageCard>
        </Boundary>

        <Boundary hydration="server" rendering="dynamic">
          <OnTimeCard>
            <Suspense
              fallback={
                <div className="flex items-center gap-4">
                  <Skeleton className="h-9 w-16" />
                  <div className="w-full space-y-2">
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              }
            >
              <OnTime searchParams={params} />
            </Suspense>
          </OnTimeCard>
        </Boundary>

        <Boundary hydration="server" rendering="dynamic">
          <MissingMeetingsCard>
            <Suspense fallback={<Skeleton className="h-9 w-6" />}>
              <MissingMeetings searchParams={params} />
            </Suspense>
          </MissingMeetingsCard>
        </Boundary>
      </section>

      {/* Filters */}
      <Boundary hydration="client" rendering="static">
        <MeetingsFiltersData searchParams={params} />
      </Boundary>

      {/* Meetings List */}
      <Suspense fallback={<MeetingListSkeleton />}>
        <MeetingsList searchParams={params} />
      </Suspense>
    </div>
  );
}

function MeetingListSkeleton() {
  return (
    <div className="relative">
      <div className="absolute -bottom-8 left-0 z-20 h-full w-full bg-linear-to-t from-background to-transparent" />
      <div className="overflow-hidden rounded-md border bg-background">
        <div className="flex justify-between gap-4 border-b">
          <div className="w-full p-4">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="w-full p-4">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="w-full p-4">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="w-full p-4">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="w-full p-4" />
        </div>
        <div className="space-y-4 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton className="h-6 w-full" key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
