import { auth } from "@/auth";
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
  const session = await auth();

  // HARD GATE: Team Lead only
  if (session?.user?.role !== "member") {
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
