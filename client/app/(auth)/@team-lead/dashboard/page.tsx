import { auth } from "@/auth";
import { ActivityLogs } from "@/components/team-lead/dashboard/activity-logs";
import { BlockedItemsList } from "@/components/team-lead/dashboard/blocked-items-list";
import { PendingApprovalsList } from "@/components/team-lead/dashboard/pending-approvals-list";
import { PhaseProgressCardsDisplay } from "@/components/team-lead/dashboard/phase-progress-cards";
import { ProjectHealthCard } from "@/components/team-lead/dashboard/project-health-card";
import { SprintHealthCard } from "@/components/team-lead/dashboard/sprint-health-card";
import { TeamContributions } from "@/components/team-lead/dashboard/team-contributions";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Dashboard",
  description: "Team Lead project overview and metrics",
};

export default async function DashboardPage() {
  // Prevent evaluation if wrong role (parallel routes evaluate all slots)
  const session = await auth();
  if (session?.user.role !== "teamLead") {
    return null;
  }

  return (
    <div className="mx-auto max-w-screen-2xl space-y-8">
      <ProjectHealthCard />
      <PhaseProgressCardsDisplay />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SprintHealthCard />
        <ActivityLogs />
        <BlockedItemsList />
        <PendingApprovalsList />
      </div>

      <div className="space-y-8">
        <Separator />
        <TeamContributions />
      </div>
    </div>
  );
}
