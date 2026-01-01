import { auth } from "@/auth";
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
  const session = await auth();

  // HARD GATE: Team Lead only
  if (session?.user?.role !== "teamLead") {
    return null;
  }

  const { logs, sprints, phases } = await getMeetingsData();

  return (
    <div className="space-y-8 pb-16">
      <SummaryCardsRow logs={logs} phases={phases} sprints={sprints} />
      <MeetingsTable
        currentUserRole={session.user.role}
        initialLogs={logs}
        phases={phases}
        sprints={sprints}
      />
    </div>
  );
}
