import { Suspense } from "react";
import { MeetingListSkeleton } from "@/components/layouts/loading";
import SummaryCardsRow from "@/components/shared/meetings/summary-cards";
import { MeetingsTable } from "@/components/shared/meetings/table/body";
import { getMeetingsData } from "@/lib/data/meetings";
import { getAuthContext } from "@/lib/helpers/auth-token";

/**
 * Team Lead Meetings Page
 *
 * Displays meeting analytics and documentation for the project
 * Fetches and aggregates meetings from all sprints and phases
 * Allows Team Lead to upload meeting minutes
 *
 * Role validation is handled by RoleBasedSlot in (auth)/layout.tsx
 */

async function MeetingsContent() {
  const { token } = await getAuthContext();
  const { logs, sprints, phases } = await getMeetingsData(token);

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

export default function TeamLeadMeetingsPage() {
  return (
    <Suspense fallback={<MeetingListSkeleton />}>
      <MeetingsContent />
    </Suspense>
  );
}
