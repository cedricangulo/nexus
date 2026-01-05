import { cookies } from "next/headers";
import { Suspense } from "react";
import { MeetingListSkeleton } from "@/components/layouts/loading";
import SummaryCardsRow from "@/components/shared/meetings/summary-cards";
import { MeetingsTable } from "@/components/shared/meetings/table/body";
import { getMeetingsData } from "@/lib/data/meetings";
import { requireTeamLead } from "@/lib/helpers/rbac";

/**
 * Team Lead Meetings Page
 *
 * Displays meeting analytics and documentation for the project
 * Fetches and aggregates meetings from all sprints and phases
 * Allows Team Lead to upload meeting minutes
 */
export default async function TeamLeadMeetingsPage() {
  // DYNAMIC: Validation & Token Extraction
  await requireTeamLead();
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";

  // STATIC/CACHED: Pass token to cached function
  const { logs, sprints, phases } = await getMeetingsData(token);

  return (
    <Suspense fallback={<MeetingListSkeleton />}>
      <div className="space-y-8 pb-16">
        <SummaryCardsRow logs={logs} phases={phases} sprints={sprints} />
        <MeetingsTable
          currentUserRole="teamLead"
          initialLogs={logs}
          phases={phases}
          sprints={sprints}
        />
      </div>
    </Suspense>
  );
}
