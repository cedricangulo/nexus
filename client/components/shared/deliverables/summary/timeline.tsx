"use cache";

import { cacheLife } from "next/cache";
import { Tracker } from "@/components/ui/tracker";
import {
	type DeliverablesFilters,
	getDeliverablesForTimeline,
} from "@/lib/data/deliverables";
import { formatTitleCase } from "@/lib/helpers";
import { formatDate } from "@/lib/helpers/format-date";
import type { Deliverable } from "@/lib/types";

const getStatusColor = (status: string): string => {
	switch (status) {
		case "COMPLETED":
		case "DONE":
			return "bg-chart-1";
		case "IN_PROGRESS":
			return "bg-chart-3";
		case "REVIEW":
			return "bg-chart-2";
		case "BLOCKED":
			return "bg-chart-4";
		case "TODO":
			return "bg-accent";
		default:
			return "bg-accent";
	}
};

function TimelineTracker({ deliverables }: { deliverables: Deliverable[] }) {
	const trackerData = deliverables.map((deliverable) => ({
		key: deliverable.id,
		color: getStatusColor(deliverable.status),
		tooltip: `${deliverable.title} - ${formatTitleCase(deliverable.status)}${
			deliverable.dueDate ? ` (Due: ${formatDate(deliverable.dueDate)})` : ""
		}`,
	}));

	if (trackerData.length === 0) {
		return <div className="text-muted-foreground text-xs">No deliverables</div>;
	}

	return <Tracker data={trackerData} showTooltip />;
}

type Props = {
	filters: DeliverablesFilters;
	token: string;
};

export async function Timeline({ filters, token }: Props) {
	cacheLife("minutes");

	const deliverables = await getDeliverablesForTimeline(token, filters);

	return <TimelineTracker deliverables={deliverables} />;
}
