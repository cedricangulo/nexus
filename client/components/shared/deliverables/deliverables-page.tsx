import { Suspense } from "react";
import Boundary from "@/components/internal/Boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { searchParamsCache } from "@/lib/types/search-params";
import { DeliverablesFilters } from "./deliverables-filters";
import { DeliverablesList } from "./deliverables-list";
import {
	MobileSummaryCard,
	Overdue,
	OverdueCard,
	SUMMARY_ITEMS,
	SummaryCardItem,
	Timeline,
	TimelineCard,
	Total,
	TotalCard,
} from "./summary";

type DeliverablesPageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DeliverablesPage({
	searchParams,
}: DeliverablesPageProps) {
	const { token } = await getAuthContext();
	const filters = searchParamsCache.parse(await searchParams);

	return (
		<div className="space-y-8">
			{/* Mobile Summary */}
			<MobileSummaryCard>
				{SUMMARY_ITEMS.map(({ label, Component, colorClass }) => (
					<SummaryCardItem
						key={label}
						label={label}
						Component={Component}
						colorClass={colorClass}
						filters={filters}
						token={token}
					/>
				))}
			</MobileSummaryCard>

			{/* Summary Cards - Each with independent Suspense */}
			<section className="hidden sm:grid grid-cols-2 gap-4 lg:grid-cols-3">
				<Boundary hydration="server" rendering="dynamic">
					<TotalCard>
						<Suspense fallback={<Skeleton className="h-9 w-6" />}>
							<Total filters={filters} token={token} />
						</Suspense>
					</TotalCard>
				</Boundary>

				<Boundary hydration="server" rendering="dynamic">
					<OverdueCard>
						<Suspense fallback={<Skeleton className="h-9 w-6" />}>
							<Overdue filters={filters} token={token} />
						</Suspense>
					</OverdueCard>
				</Boundary>

				<Boundary hydration="server" rendering="dynamic">
					<TimelineCard>
						<Suspense fallback={<Skeleton className="h-8 w-full rounded-xs" />}>
							<Timeline filters={filters} token={token} />
						</Suspense>
					</TimelineCard>
				</Boundary>
			</section>

			<Boundary hydration="client" rendering="static">
				<DeliverablesFilters />
			</Boundary>

			{/* Deliverables List */}
			<Suspense fallback={<DeliverablesListSkeleton />}>
				<DeliverablesList filters={filters} token={token} />
			</Suspense>
		</div>
	);
}

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
