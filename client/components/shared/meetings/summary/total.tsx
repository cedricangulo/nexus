"use cache";

import { cacheLife } from "next/cache";
import { getTotalMeetingsData, type MeetingFilters } from "@/lib/data/meetings";

type Props = {
	filters: MeetingFilters;
	token: string;
};

/**
 * TotalMeetings Data Component
 * Fetches and displays total count of filtered meetings
 */
export async function TotalMeetings({ filters, token }: Props) {
	cacheLife("minutes");

	const total = await getTotalMeetingsData(token, filters);

	return <div className="font-bold font-sora text-3xl">{total}</div>;
}
