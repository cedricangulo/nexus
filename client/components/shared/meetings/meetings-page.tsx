import { Suspense } from "react";
import Boundary from "@/components/internal/Boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { meetingSearchParamsCache } from "@/lib/types/search-params";
import { MeetingsFilters } from "./meetings-filters";
import { MeetingsList } from "./meetings-list";
import {
	Coverage,
	CoverageCard,
	MissingMeetings,
	MissingMeetingsCard,
	MobileSummaryCard,
	OnTime,
	OnTimeCard,
	SUMMARY_ITEMS,
	SummaryCardItem,
	TotalMeetings,
	TotalMeetingsCard,
} from "./summary";

type MeetingsPageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MeetingsPage({
	searchParams,
}: MeetingsPageProps) {
	const { token } = await getAuthContext();
	const params = await searchParams;
	const filters = meetingSearchParamsCache.parse(params);

	return (
		<div className="space-y-8 pb-16">
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
			<section className="hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
				<Boundary hydration="server" rendering="dynamic">
					<TotalMeetingsCard>
						<Suspense fallback={<Skeleton className="h-9 w-6" />}>
							<TotalMeetings filters={filters} token={token} />
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
							<Coverage filters={filters} token={token} />
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
							<OnTime filters={filters} token={token} />
						</Suspense>
					</OnTimeCard>
				</Boundary>

				<Boundary hydration="server" rendering="dynamic">
					<MissingMeetingsCard>
						<Suspense fallback={<Skeleton className="h-9 w-6" />}>
							<MissingMeetings filters={filters} token={token} />
						</Suspense>
					</MissingMeetingsCard>
				</Boundary>
			</section>

			{/* Filters */}
			<Boundary hydration="client" rendering="static">
				<MeetingsFilters filters={filters} token={token} />
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
				</div>
				{[1, 2, 3].map((i) => (
					<div key={i} className="flex justify-between gap-4 border-b">
						<div className="w-full p-4">
							<Skeleton className="h-4 w-full" />
						</div>
						<div className="w-full p-4">
							<Skeleton className="h-4 w-full" />
						</div>
						<div className="w-full p-4">
							<Skeleton className="h-4 w-full" />
						</div>
						<div className="w-full p-4">
							<Skeleton className="h-4 w-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
