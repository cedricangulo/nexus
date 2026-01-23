import { getFilteredMeetingsData } from "@/lib/data/meetings";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { meetingSearchParamsCache } from "@/lib/types/search-params";
import { MeetingsTable } from "./table/body";

type MeetingsListProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * MeetingsList Server Component
 * Fetches filtered meeting data and renders the meetings table
 */
export async function MeetingsList({ searchParams }: MeetingsListProps) {
  const { token } = await getAuthContext();
  const filters = meetingSearchParamsCache.parse(searchParams);
  const { logs, sprints, phases, scopeCounts } = await getFilteredMeetingsData(
    token,
    filters
  );

  return (
    <MeetingsTable
      initialLogs={logs}
      phases={phases}
      scopeCounts={scopeCounts}
      sprints={sprints}
    />
  );
}
