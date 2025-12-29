import { notFound, unauthorized } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { DeliverableDetails } from "@/components/shared/deliverables";
import { getDeliverableDetail } from "@/lib/data/deliverables";
import { getTeamMembersForMentions } from "@/lib/data/team-members";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberDeliverableDetailPage({
  params,
}: PageProps) {
  const session = await auth();

  // HARD GATE: Member only
  if (session?.user?.role !== "member") {
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
      <DeliverableDetails
        comments={comments}
        controls={{ canReview: false, isPending: false }}
        deliverable={deliverable}
        evidence={evidence}
        phase={phase}
        teamMembers={teamMembers}
        user={session.user}
      />
    </Suspense>
  );
}
