import { getTeamMembersForMentions } from "@/lib/data/team-members";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { Comments } from "./comments";
import { getCommentsByDeliverable } from "@/lib/data/deliverables";

type CommentSectionProps = {
  id: string;
};

export default async function CommentSection({
  id,
}: CommentSectionProps) {
  const { user, token } = await getAuthContext();

  const [comments, teamMembers] = await Promise.all([
    getCommentsByDeliverable(id, token),
    getTeamMembersForMentions(token, user.role),
  ]);

  return (
    <Comments
      comments={comments}
      deliverableId={id}
      teamMembers={teamMembers}
    />
  );
}
