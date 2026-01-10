import { getTeamMembersForMentions } from "@/lib/data/team-members";
import { getAuthContext } from "@/lib/helpers/auth-token";
import type { Comment, Deliverable } from "@/lib/types";
import { Comments } from "./comments";

type CommentSectionProps = {
  deliverable: Deliverable;
  comments: Comment[];
};

export default async function CommentSection({
  deliverable,
  comments,
}: CommentSectionProps) {
  const { user, token } = await getAuthContext();

  const [teamMembers] = await Promise.all([
    getTeamMembersForMentions(token, user.role),
  ]);

  return (
    <Comments
      comments={comments}
      deliverableId={deliverable.id}
      teamMembers={teamMembers}
    />
  );
}
