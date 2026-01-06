/**
 * Team Contributions
 * Server component that fetches and displays team member contributions
 */

import { formatDistanceToNow } from "date-fns";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { FramePanel } from "@/components/ui/frame";
import { getActivityLogs } from "@/lib/data/activity-logs";
import { getTasks } from "@/lib/data/tasks";
import { getUserContribution, getUsers } from "@/lib/data/users";
import { getAuthContext } from "@/lib/helpers/auth-token";
import type { TeamMemberSummary } from "@/lib/helpers/dashboard-computations";
import { computeTeamMemberSummary } from "@/lib/helpers/dashboard-computations";
import { ChartRadialText } from "./chart";

type TeamContributionsDisplayProps = {
  members: TeamMemberSummary[];
};

function TeamContributionsDisplay({ members }: TeamContributionsDisplayProps) {
  if (members.length === 0) {
    return (
      <EmptyState
        description="Add team members to see their contributions"
        icon={Users}
        title="No team members"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => {
        const completionRate =
          member.tasksAssigned > 0
            ? (member.tasksCompleted / member.tasksAssigned) * 100
            : 0;

        return (
          <FramePanel className="bg-card" key={member.id}>
            {/* Member Info */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm leading-none">
                    {member.name}
                  </p>
                  <p className="truncate text-muted-foreground text-xs">
                    {member.email}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3">
                  <div className="text-center">
                    <p className="font-semibold font-sora text-lg">
                      {member.tasksAssigned}
                    </p>
                    <p className="mb-1 text-muted-foreground text-xs">
                      Assigned
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold font-sora text-lg">
                      {member.tasksCompleted}
                    </p>
                    <p className="mb-1 text-muted-foreground text-xs">
                      Completed
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold font-sora text-lg">
                      {member.evidenceUploaded}
                    </p>
                    <p className="mb-1 text-muted-foreground text-xs">
                      Evidence
                    </p>
                  </div>
                </div>
              </div>
              {/* Radial Chart */}
              <div className="shrink-0">
                <ChartRadialText
                  className="h-24 w-24"
                  color="var(--chart-2)"
                  innerRadius={45}
                  label="Done"
                  outerRadius={65}
                  polarRadius={[47, 37]}
                  value={completionRate}
                />
              </div>
            </div>

            {/* Last Activity */}
            {member.lastActivity ? (
              <p className="mt-4 text-muted-foreground text-xs">
                Last activity:{" "}
                <span className="text-foreground">
                  {formatDistanceToNow(new Date(member.lastActivity), {
                    addSuffix: false,
                  })}
                </span>
              </p>
            ) : null}
          </FramePanel>
        );
      })}
    </div>
  );
}

export async function TeamContributions() {
  const { token } = await getAuthContext();
  const [users, tasks, activityLogs] = await Promise.all([
    getUsers(token),
    getTasks(token),
    getActivityLogs(token),
  ]);

  const activeUsers = users.filter((u) => !u.deletedAt);

  const memberSummaries = (
    await Promise.all(
      activeUsers.map(async (user) => {
        const contribution = await getUserContribution(user.id, token);

        // Skip users without contribution data
        if (!contribution) {
          return null;
        }

        const userActivities = activityLogs.filter(
          (log) => log.userId === user.id
        );
        const lastActivityDate =
          userActivities.length > 0
            ? userActivities.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )[0].createdAt
            : undefined;

        return computeTeamMemberSummary(
          user,
          contribution,
          tasks,
          lastActivityDate
        );
      })
    )
  ).filter((m): m is TeamMemberSummary => m !== null);

  return <TeamContributionsDisplay members={memberSummaries} />;
}
