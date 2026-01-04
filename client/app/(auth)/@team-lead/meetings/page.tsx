import SummaryCardsRow from "@/components/shared/meetings/summary-cards";
import { MeetingsTable } from "@/components/shared/meetings/table/body";
import { getMeetingsData } from "@/lib/data/meetings";

/**
 * Team Lead Meetings Page
 *
 * Displays meeting analytics and documentation for the project
 * Fetches and aggregates meetings from all sprints and phases
 * Allows Team Lead to upload meeting minutes
 */
export default async function TeamLeadMeetingsPage() {
  // Auth and role validation handled by parent layout
  const { logs, sprints, phases } = await getMeetingsData();

  return (
    <div className="space-y-8 pb-16">
      <SummaryCardsRow logs={logs} phases={phases} sprints={sprints} />
      <MeetingsTable
        currentUserRole="teamLead"
        initialLogs={logs}
        phases={phases}
        sprints={sprints}
      />
    </div>
  );
}
