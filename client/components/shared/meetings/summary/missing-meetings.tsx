import { cacheLife } from "next/cache";
import {
	getMissingMeetingsData,
	type MeetingFilters,
} from "@/lib/data/meetings";

type Props = {
	filters: MeetingFilters;
	token: string;
};

/**
 * MissingMeetings Data Component
 * Fetches and displays missing meetings data
 */
export async function MissingMeetings({ filters, token }: Props) {
	"use cache";
	cacheLife("minutes");

	const missing = await getMissingMeetingsData(token, filters);

	return (
		<div className="flex items-center gap-2">
			<MissingMeetingsCount count={missing.count} />
			<p className="grid text-muted-foreground text-xs">
				{missing.sprints.length > 0 && (
					<>
						{missing.sprints.length} sprint
						{missing.sprints.length !== 1 ? "s" : ""}
						{missing.phases.length > 0 && " and "}
					</>
				)}{" "}
				{missing.phases.length > 0 && (
					<>
						{missing.phases.length} phase
						{missing.phases.length !== 1 ? "s" : ""}
					</>
				)}
				<span>{missing.count > 0 && " without meetings"}</span>
			</p>
		</div>
	);
}

export function MissingMeetingsCount({ count }: { count: number }) {
	return <h4 className="font-bold font-sora text-3xl">{count}</h4>;
}

/**
 * Missing Meetings Mobile Summary Component
 * Wrapper for mobile summary that fetches and displays only the count
 */
export async function MissingMeetingsCountWrapper({ filters, token }: Props) {
	"use cache";
	cacheLife("minutes");

	const missing = await getMissingMeetingsData(token, filters);

	return <MissingMeetingsCount count={missing.count} />;
}
