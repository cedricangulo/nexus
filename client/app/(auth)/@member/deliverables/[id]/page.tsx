import { notFound } from "next/navigation";
import { Suspense } from "react";
import MemberDeliverableActions from "@/components/member/deliverables/actions";
import { getDeliverableDetail } from "@/lib/data/deliverables";
import { getTeamMembersForMentions } from "@/lib/data/team-members";
import { getCurrentUser } from "@/lib/data/user";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberDeliverableDetailPage({
  params,
}: PageProps) {
  // Auth and role validation handled by parent layout
  const { id } = await params;

  const [{ deliverable, evidence, phase, comments }, teamMembers, user] =
    await Promise.all([
      getDeliverableDetail(id),
      getTeamMembersForMentions(),
      getCurrentUser(),
    ]);

  if (!(deliverable && user)) {
    notFound();
  }

  return (
    <Suspense
      fallback={<div className="py-8 text-center">Loading deliverable...</div>}
    >
      <MemberDeliverableActions
        comments={comments}
        deliverable={deliverable}
        evidence={evidence}
        phase={phase}
        teamMembers={teamMembers}
        user={user}
      />
    </Suspense>
  );
}
