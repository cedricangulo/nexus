import { Suspense } from "react";
import { MeetingListSkeleton } from "@/components/layouts/loading";
import SummaryCardsRow from "@/components/shared/meetings/summary-cards";
import { MeetingsTable } from "@/components/shared/meetings/table/body";
import { getMeetingsData } from "@/lib/data/meetings";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { requireUser } from "@/lib/helpers/rbac";

/**
 * Member Meetings Page
 *
 * Read-only view of meeting logs and analytics for team members.
 * Members can view meeting documentation and analytics
 * but cannot upload or manage meeting minutes (Team Lead only).
 */
export default async function MemberMeetingsPage() {
  // DYNAMIC: Validate user is authenticated
  await requireUser();
  const { token } = await getAuthContext();

  const { logs, sprints, phases } = await getMeetingsData(token);

  return (
    <Suspense fallback={<MeetingListSkeleton />}>
      <div className="space-y-8 pb-16">
        <SummaryCardsRow logs={logs} phases={phases} sprints={sprints} />
        <MeetingsTable
          currentUserRole="member"
          initialLogs={logs}
          phases={phases}
          sprints={sprints}
        />
      </div>
    </Suspense>
  );
}
