import { notFound, unauthorized } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import TeamLeadDeliverableActions from "@/components/team-lead/deliverables/actions";
import { getDeliverableDetail } from "@/lib/data/deliverables";
import { getTeamMembersForMentions } from "@/lib/data/team-members";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeamLeadDeliverableDetailPage({
  params,
}: PageProps) {
  const session = await auth();

  // HARD GATE: Team Lead only
  if (session?.user?.role !== "teamLead") {
    return unauthorized();
  }

  const { id } = await params;

  const [{ deliverable, evidence, phase, comments }, teamMembers] =
    await Promise.all([getDeliverableDetail(id), getTeamMembersForMentions()]);

  if (!deliverable) {
    notFound();
  }

  return (
    <Suspense
      fallback={<div className="py-8 text-center">Loading deliverable...</div>}
    >
      <TeamLeadDeliverableActions
        comments={comments}
        deliverable={deliverable}
        evidence={evidence}
        phase={phase}
        teamMembers={teamMembers}
        user={session.user}
      />
    </Suspense>
  );
}
