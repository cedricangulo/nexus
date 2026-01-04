import { notFound } from "next/navigation";
import TeamLeadDeliverableActions from "@/components/team-lead/deliverables/actions";
import { getDeliverableDetail } from "@/lib/data/deliverables";
import { getTeamMembersForMentions } from "@/lib/data/team-members";
import { getCurrentUser } from "@/lib/data/user";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeamLeadDeliverableDetailPage({
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
    <TeamLeadDeliverableActions
      comments={comments}
      deliverable={deliverable}
      evidence={evidence}
      phase={phase}
      teamMembers={teamMembers}
      user={user}
    />
  );
}
