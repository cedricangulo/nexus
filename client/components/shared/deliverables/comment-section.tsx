"use client";

import { SendIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createDeliverableCommentAction } from "@/actions/deliverable-comments";
import { Button } from "@/components/ui/button";
import {
  Mention,
  MentionContent,
  MentionInput,
  MentionItem,
  MentionPortal,
} from "@/components/ui/mention";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { formatTitleCase } from "@/lib/helpers";
import {
  getGroupPosition,
  getRoundedClasses,
  shouldShowMetadata,
} from "@/lib/helpers/comment-grouping";
import { formatRelativeTime } from "@/lib/helpers/format-date";
import { convertDisplayToStorage, parseMentions } from "@/lib/helpers/mentions";
import type { Comment } from "@/lib/types";
import { cn } from "@/lib/utils";

type CommentSectionProps = {
  comments: Comment[];
  deliverableId: string;
  teamMembers: Array<{ id: string; label: string; value: string }>;
  user?: { id?: string; role?: string };
};

/**
 * Render comment content with styled mentions
 * Parses @[Name](id) patterns and renders mentions in blue
 */
function CommentContent({ content }: { content: string }) {
  const segments = parseMentions(content);

  return (
    <p className="max-w-prose text-sm">
      {segments.map((segment, index) => {
        if (segment.type === "mention") {
          return (
            <span
              className="font-semibold text-primary"
              key={`${segment.userId}-${index}`}
            >
              @{segment.userName}
            </span>
          );
        }
        return <span key={`text-${index}`}>{segment.content}</span>;
      })}
    </p>
  );
}

/**
 * Helper: Determine the role label for a comment
 * @param user - Current user info
 * @param author - Comment author info
 * @param isMine - Whether the comment is from the current user
 * @returns Formatted role label string
 */
function getRoleLabel(
  user: { id?: string; role?: string } | undefined,
  author: { role?: string } | undefined,
  isMine: boolean
): string {
  const role = isMine ? user?.role : author?.role;
  return formatTitleCase(role || "");
}

/**
 * Individual comment bubble component
 *
 * Renders a single comment with proper grouping styling, metadata display,
 * and mention highlighting.
 */
type CommentItemProps = {
  comment: Comment;
  index: number;
  allComments: Comment[];
  currentUser?: { id?: string; role?: string };
};

function CommentItem({
  comment,
  index,
  allComments,
  currentUser,
}: CommentItemProps) {
  const isMine = !!currentUser?.id && comment.authorId === currentUser.id;
  const position = getGroupPosition(allComments, index);
  const showMetadata = shouldShowMetadata(position);
  const roleLabel = getRoleLabel(currentUser, comment.author, isMine);
  const roundedClasses = getRoundedClasses(isMine, position);

  return (
    <div
      className={cn(
        "scroll-m-20 space-y-1",
        isMine ? "justify-end text-right" : "justify-start text-left",
        position === "first" || position === "single" ? "mt-4" : "mt-1"
      )}
      id={`comment-${comment.id}`}
      key={comment.id}
    >
      {showMetadata ? (
        <span
          className={cn(
            "flex flex-wrap gap-1 text-muted-foreground text-xs",
            isMine ? "justify-end" : "justify-start"
          )}
        >
          <span className="font-medium">
            {isMine ? "You" : comment.author?.name || "Unknown User"}
          </span>
          •<span>{formatRelativeTime(comment.createdAt)}</span>
          {!isMine && roleLabel && (
            <>
              • <span className="font-medium">{roleLabel}</span>
            </>
          )}
        </span>
      ) : null}

      <div
        className={cn(
          "w-fit px-3 py-2 text-foreground transition-all",
          isMine
            ? "ml-auto bg-primary/80 [&_p]:text-white [&_span]:text-white"
            : "bg-card",
          roundedClasses
        )}
      >
        <CommentContent content={comment.content} />
      </div>
    </div>
  );
}

/**
 * Comment Section for Deliverables
 *
 * Features:
 * - Display existing comments with styled mentions
 * - Mention input with @trigger for team member suggestions
 * - Auto-format mentions as @[Name](id) on selection
 * - Submit comments with automatic notification creation
 * - Real-time UI updates via server actions
 */
export function CommentSection({
  comments,
  deliverableId,
  teamMembers,
  user,
}: CommentSectionProps) {
  const [comment, setComment] = useState("");
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const [mentionResetKey, setMentionResetKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleFilter = (options: string[], term: string) => {
    const normalized = term.trim().toLowerCase();
    if (!normalized) {
      return options;
    }

    const matches = teamMembers
      .filter(
        (member) =>
          member.label.toLowerCase().includes(normalized) ||
          member.value.toLowerCase().includes(normalized)
      )
      .map((member) => member.id);

    return matches.filter((id) => options.includes(id));
  };

  const handleSubmit = () => {
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    startTransition(async () => {
      const storageContent = convertDisplayToStorage(comment, teamMembers);

      const result = await createDeliverableCommentAction({
        deliverableId,
        content: storageContent,
      });

      if (result.success) {
        setComment("");
        setMentionIds([]);
        setMentionResetKey((prev) => prev + 1);
      } else {
        toast.error(result.error ?? "Failed to add comment");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground text-sm">Comments</h3>

        {comments.length === 0 ? (
          <p className="py-12 text-muted-foreground text-sm">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <ScrollArea className="h-96 pr-4 lg:h-75">
            {comments.map((c, i) => (
              <CommentItem
                allComments={comments}
                comment={c}
                currentUser={user}
                index={i}
                key={c.id}
              />
            ))}
            <ScrollBar />
          </ScrollArea>
        )}
      </div>

      <div className="space-y-2">
        <Mention
          disabled={isPending}
          inputValue={comment}
          key={mentionResetKey}
          loop
          onFilter={handleFilter}
          onInputValueChange={setComment}
          onValueChange={setMentionIds}
          trigger="@"
          value={mentionIds}
        >
          <MentionInput
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Add a comment..."
          />
          <MentionPortal>
            <MentionContent>
              {teamMembers.map((member) => (
                <MentionItem
                  key={member.id}
                  label={member.label}
                  value={member.id}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{member.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {member.value}
                    </span>
                  </div>
                </MentionItem>
              ))}
            </MentionContent>
          </MentionPortal>
        </Mention>

        <div className="flex items-center justify-between gap-2">
          <p className="hidden text-muted-foreground text-xs md:block">
            Tip: Press Cmd/Ctrl + Enter to submit
          </p>
          <Button
            disabled={isPending || !comment.trim()}
            onClick={handleSubmit}
            variant="secondary"
          >
            {isPending ? (
              <>
                <Spinner /> Post Comment
              </>
            ) : (
              <>
                <SendIcon /> Post Comment
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
