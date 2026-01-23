import {
	getFilteredMeetingsData,
	type MeetingFilters,
} from "@/lib/data/meetings";
import { MeetingsTableFilters } from "./table/meetings-table-filters";

type Props = {
	filters: MeetingFilters;
	token: string;
};

/**
 * MeetingsFilters Server Component
 * Fetches necessary data for filters and renders client-side filter component
 */
export async function MeetingsFilters({ filters, token }: Props) {
	const { sprints, phases, scopeCounts } = await getFilteredMeetingsData(
		token,
		filters,
	);

	return (
		<MeetingsTableFilters
			phases={phases}
			scopeCounts={scopeCounts}
			sprints={sprints}
		/>
	);
}
