import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import ContributionsTab from "@/components/team-lead/dashboard/contributions";
import Overview from "@/components/team-lead/dashboard/overview";
import PhasesTab from "@/components/team-lead/dashboard/phases";
import SprintsTab from "@/components/team-lead/dashboard/sprints";
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
        <Overview />
        <Tabs defaultValue="phases">
          <TabsList>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="sprints">Sprints</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          <TabsContent value="phases">
            <PhasesTab />
          </TabsContent>
          <TabsContent value="sprints">
            <SprintsTab />
          </TabsContent>
          <TabsContent value="deliverables">
            deliverables tab content
          </TabsContent>
          <TabsContent value="contributions">
            <ContributionsTab />
          </TabsContent>
          <TabsContent value="timeline">
            <p />
          </TabsContent>
        </Tabs>
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
