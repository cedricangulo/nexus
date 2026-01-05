import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeliverableDetailSkeleton } from "@/components/layouts/loading";
import TeamLeadDeliverableActions from "@/components/team-lead/deliverables/actions";
import { getDeliverableDetail } from "@/lib/data/deliverables";
import { getTeamMembersForMentions } from "@/lib/data/team-members";
import { getAuthContext } from "@/lib/helpers/auth-token";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeamLeadDeliverableDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const { user, token } = await getAuthContext();

  const [{ deliverable, evidence, phase, comments }, teamMembers] =
    await Promise.all([
      getDeliverableDetail(id, token),
      getTeamMembersForMentions(token, user.role),
    ]);

  if (!(deliverable && user)) {
    notFound();
  }

  return (
    <Suspense fallback={<DeliverableDetailSkeleton />}>
      <TeamLeadDeliverableActions
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
