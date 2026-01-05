import { Suspense } from "react";
import { TeamMemberListSkeleton } from "@/components/layouts/loading";
import TeamMembers from "@/components/team-lead/settings/team-members";

export default async function TeamMembersPage() {
  // Auth and role validation handled by parent layout
  return (
    <Suspense fallback={<TeamMemberListSkeleton />}>
      <TeamMembers />
    </Suspense>
  );
}
