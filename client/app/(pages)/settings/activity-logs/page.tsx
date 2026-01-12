import { Suspense } from "react";
import { ActivityLogListSkeleton } from "@/components/layouts/loading";
import { ActivityLogsClient } from "@/components/team-lead/settings/activity-logs/client";
import { getActivityLogs } from "@/lib/data/activity-logs";
import { getAuthContext } from "@/lib/helpers/auth-token";

export const metadata = {
  title: "Activity Logs",
  description: "View all team activity and system events",
};

export default async function ActivityLogsPage() {
  const { token } = await getAuthContext();
  // Auth and role validation handled by parent layout
  const activities = await getActivityLogs(token);

  return (
    <Suspense fallback={<ActivityLogListSkeleton />}>
      <ActivityLogsClient activities={activities} userRole="teamLead" />
    </Suspense>
  );
}
