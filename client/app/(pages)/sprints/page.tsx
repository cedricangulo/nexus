import { Suspense } from "react";
import { SprintsFilters } from "@/components/shared/sprints/sprints-filters";
import { SprintsList } from "@/components/shared/sprints/sprints-list";
import {
	Active,
	ActiveCard,
	MobileSummaryCard,
	SUMMARY_ITEMS,
	SummaryCardItem,
	Total,
	TotalCard,
	Upcoming,
	UpcomingCard,
} from "@/components/shared/sprints/summary";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { sprintSearchParamsCache } from "@/lib/types/search-params";

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
	const { token, user } = await getAuthContext();

	const filters = sprintSearchParamsCache.parse(await searchParams);

	return (
		<div className="space-y-8">
			{/* Summary Cards */}
			<MobileSummaryCard>
				{SUMMARY_ITEMS.map(({ label, Component, colorClass }) => (
					<SummaryCardItem
						key={label}
						label={label}
						Component={Component}
						colorClass={colorClass}
						filters={filters}
						token={token}
						user={user}
					/>
				))}
			</MobileSummaryCard>
			<div className="hidden sm:grid grid-cols-2 gap-4 sm:grid-cols-3">
				<TotalCard>
					<Suspense fallback={<Skeleton className="h-9 w-6" />}>
						<Total filters={filters} token={token} user={user} />
					</Suspense>
				</TotalCard>
				<ActiveCard>
					<Suspense fallback={<Skeleton className="h-9 w-6" />}>
						<Active filters={filters} token={token} user={user} />
					</Suspense>
				</ActiveCard>
				<UpcomingCard>
					<Suspense fallback={<Skeleton className="h-9 w-6" />}>
						<Upcoming filters={filters} token={token} user={user} />
					</Suspense>
				</UpcomingCard>
			</div>

			{/* Filters */}
			<SprintsFilters />

			{/* Sprint List */}
			<Suspense fallback={<SprintListSkeleton />}>
				<SprintsList filters={filters} token={token} user={user} />
			</Suspense>
		</div>
	);
}

function SprintListSkeleton() {
	return (
		<section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
			{[1, 2, 3].map((key) => (
				<Skeleton key={key} className="h-54.5 w-full" />
			))}
		</section>
	);
}
