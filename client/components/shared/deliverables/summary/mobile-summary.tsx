import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeliverablesFilters } from "@/lib/data/deliverables";
import { Overdue } from "./overdue";
import { Timeline } from "./timeline";
import { Total } from "./total";

export const SUMMARY_ITEMS = [
	{ label: "Total", Component: Total, colorClass: "text-info-foreground" },
	{
		label: "Overdue",
		Component: Overdue,
		colorClass: "text-error-foreground",
	},
	{
		label: "Timeline",
		Component: Timeline,
		colorClass: "text-warning-foreground",
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
		filters: DeliverablesFilters;
		token: string;
	}>;
	colorClass: string;
	filters: DeliverablesFilters;
	token: string;
}) {
	return (
		<div className={colorClass}>
			<Suspense fallback={<Skeleton className="mx-auto h-9 w-4" />}>
				<Component filters={filters} token={token} />
			</Suspense>
			<span className="text-muted-foreground text-xs">{label}</span>
		</div>
	);
}
