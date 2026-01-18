import { ActivityLogs } from "@/components/team-lead/dashboard/activity-logs";
import { BlockedItemsList } from "@/components/team-lead/dashboard/blocked-items-list";
import { PendingApprovalsList } from "@/components/team-lead/dashboard/pending-approvals-list";
import { PhaseProgressCardsDisplay } from "@/components/team-lead/dashboard/phase-progress-cards";
import { ProjectHealthCard } from "@/components/team-lead/dashboard/project-health-card";
import { SprintHealthCard } from "@/components/team-lead/dashboard/sprint-health-card";
import { TeamContributions } from "@/components/team-lead/dashboard/team-contributions";
import { Separator } from "@/components/ui/separator";
import { getAuthContext } from "@/lib/helpers/auth-token";

export const metadata = {
  title: "Dashboard",
  description: "Project overview and metrics",
};

/**
 * Unified Dashboard Page
 *
 * Renders role-appropriate dashboard content:
 * - TEAM_LEAD: Full project health, sprints, activity, blocked items, approvals
 * - MEMBER: Assigned tasks overview (placeholder)
 * - ADVISER: Project review overview (placeholder)
 */
export default async function DashboardPage() {
  const { user } = await getAuthContext();

  // Team Lead Dashboard
  if (user?.role === "TEAM_LEAD") {
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

  // Member Dashboard (placeholder)
  if (user?.role === "MEMBER") {
    return (
      <div className="mx-auto max-w-screen-2xl space-y-8">
        {/* TODO: Member dashboard components */}
        {/* - Project information */}
        {/* - Assigned tasks in phases */}
        {/* - Assigned tasks in sprints */}
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Member dashboard coming soon
        </div>
      </div>
    );
  }

  // Adviser Dashboard (placeholder)
  return (
    <div className="mx-auto max-w-screen-2xl space-y-8">
      {/* TODO: Adviser dashboard components */}
      {/* - Projects overview */}
      {/* - Review queue */}
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Adviser dashboard coming soon
      </div>
    </div>
  );
}
