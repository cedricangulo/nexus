import { ActivityLogsClient } from "@/components/team-lead/settings/activity-logs/client";
import { activityLogApi } from "@/lib/api/activity-log";

export const metadata = {
  title: "Activity Logs",
  description: "View all team activity and system events",
};

export default async function ActivityLogsPage() {
  // Auth and role validation handled by parent layout
  const activities = await activityLogApi.listActivityLogs();

  return <ActivityLogsClient activities={activities} userRole="teamLead" />;
}
