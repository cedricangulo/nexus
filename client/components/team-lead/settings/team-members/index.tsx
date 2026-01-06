import { TeamMembersClient } from "@/components/team-lead/settings/team-members/client";
import { getTeamUsers } from "@/lib/data/team";
import { getAuthContext } from "@/lib/helpers/auth-token";

export const metadata = {
  title: "Team Members",
  description: "Manage and invite team members",
};

export default async function TeamMembersPage() {
  const { user: currentUser, token } = await getAuthContext();
  const data = await getTeamUsers(token);

  return <TeamMembersClient currentUser={currentUser} data={data} />;
}
