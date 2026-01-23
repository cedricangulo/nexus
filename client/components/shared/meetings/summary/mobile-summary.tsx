import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { MeetingFilters } from "@/lib/data/meetings";
import { CoveragePercentageWrapper } from "./coverage";
import { MissingMeetingsCountWrapper } from "./missing-meetings";
import { OnTimePercentageWrapper } from "./on-time";
import { TotalMeetings } from "./total";

export const SUMMARY_ITEMS = [
	{
		label: "Total",
		Component: TotalMeetings,
		colorClass: "text-info-foreground",
	},
	{
		label: "Coverage",
		Component: CoveragePercentageWrapper,
		colorClass: "text-success-foreground",
	},
	{
		label: "On-Time",
		Component: OnTimePercentageWrapper,
		colorClass: "text-scrum-foreground",
	},
	{
		label: "Missing",
		Component: MissingMeetingsCountWrapper,
		colorClass: "text-info-foreground",
	},
] as const;

export function SummaryCardItem({
	label,
	Component,
	colorClass,
	filters,
	token,
}: {
	label: string;
	Component: React.ComponentType<{
		filters: MeetingFilters;
		token: string;
	}>;
	colorClass: string;
	filters: MeetingFilters;
	token: string;
}) {
	return (
		<div className={colorClass}>
			<Suspense fallback={<Skeleton className="mx-auto h-9 w-12" />}>
				<Component filters={filters} token={token} />
			</Suspense>
			<span className="text-muted-foreground text-xs">{label}</span>
		</div>
	);
}
