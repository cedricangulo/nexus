import SummaryCardsRow from "@/components/shared/meetings/summary-cards";
import { MeetingsTable } from "@/components/shared/meetings/table/body";
import { getMeetingsData } from "@/lib/data/meetings";

/**
 * Member Meetings Page
 *
 * Read-only view of meeting logs and analytics for team members.
 * Members can view meeting documentation and analytics
 * but cannot upload or manage meeting minutes (Team Lead only).
 */
export default async function MemberMeetingsPage() {
  // Auth and role validation handled by parent layout
  const { logs, sprints, phases } = await getMeetingsData();

  return (
    <div className="space-y-8 pb-16">
      <SummaryCardsRow logs={logs} phases={phases} sprints={sprints} />
      <MeetingsTable
        currentUserRole="member"
        initialLogs={logs}
        phases={phases}
        sprints={sprints}
      />
    </div>
  );
}
