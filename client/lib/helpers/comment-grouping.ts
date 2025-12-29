/**
 * Comment Grouping Helpers
 *
 * Utilities for determining comment group membership and styling based on
 * author, timestamp, and position within a group.
 *
 * @module lib/helpers/comment-grouping
 */

import type { Comment } from "@/lib/types";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

/**
 * Determine if a comment should be grouped with the previous one.
 *
 * Comments group if they are from the same author AND sent within 5 minutes.
 *
 * @param comments - Array of comments
 * @param currentIndex - Index of the comment to check
 * @returns true if this comment should be grouped with the previous
 */
export function shouldGroupWithPrevious(
  comments: Comment[],
  currentIndex: number
): boolean {
  if (currentIndex === 0) {
    return false;
  }

  const prevComment = comments[currentIndex - 1];
  const currComment = comments[currentIndex];

  const isSameAuthor = prevComment.authorId === currComment.authorId;
  const prevTime = new Date(prevComment.createdAt).getTime();
  const currTime = new Date(currComment.createdAt).getTime();
  const isWithinTimeThreshold = currTime - prevTime < FIVE_MINUTES_MS;

  return isSameAuthor && isWithinTimeThreshold;
}

/**
 * Determine if the next comment is from the same author and within time threshold.
 *
 * @param comments - Array of comments
 * @param currentIndex - Index of the comment to check
 * @returns true if the next comment is from the same author and within time threshold
 */
export function hasNextSameAuthorInGroup(
  comments: Comment[],
  currentIndex: number
): boolean {
  if (currentIndex >= comments.length - 1) {
    return false;
  }

  const currComment = comments[currentIndex];
  const nextComment = comments[currentIndex + 1];

  const isSameAuthor = currComment.authorId === nextComment.authorId;
  const currTime = new Date(currComment.createdAt).getTime();
  const nextTime = new Date(nextComment.createdAt).getTime();
  const isWithinTimeThreshold = nextTime - currTime < FIVE_MINUTES_MS;

  return isSameAuthor && isWithinTimeThreshold;
}

/**
 * Determine the position of a comment within its group.
 *
 * Possible values:
 * - 'single': Comment is alone (not grouped)
 * - 'first': First message in a group
 * - 'middle': Middle message in a group
 * - 'last': Last message in a group
 *
 * @param comments - Array of comments
 * @param currentIndex - Index of the comment
 * @returns Position of the comment in its group
 */
export function getGroupPosition(
  comments: Comment[],
  currentIndex: number
): "single" | "first" | "middle" | "last" {
  const shouldGroup = shouldGroupWithPrevious(comments, currentIndex);
  const hasNext = hasNextSameAuthorInGroup(comments, currentIndex);

  if (!(shouldGroup || hasNext)) {
    return "single";
  }
  if (!shouldGroup && hasNext) {
    return "first";
  }
  if (shouldGroup && hasNext) {
    return "middle";
  }
  return "last";
}

/**
 * Get Tailwind classes for rounded corners based on position and ownership.
 *
 * Creates a chat-bubble effect where corners are shaped based on:
 * - Whether the message is from the current user (isMine)
 * - The position within a group (first, middle, last, single)
 *
 * @param isMine - Whether the comment is from the current user
 * @param position - Position of the comment in its group
 * @returns Tailwind class string for border-radius
 */
export function getRoundedClasses(
  isMine: boolean,
  position: "single" | "first" | "middle" | "last"
): string {
  if (isMine) {
    // Current user (Right side) - sharp corner pointing left
    switch (position) {
      case "first":
        return "rounded-2xl rounded-tr-md"; // Top: sharp top-right
      case "middle":
        return "rounded-l-2xl rounded-r-md"; // Middle: flat on right
      case "last":
        return "rounded-2xl rounded-tr-md"; // Bottom: sharp top-right
      default:
        return "rounded-2xl rounded-tr-md"; // All rounded except top-right
    }
  }

  // Other users (Left side) - sharp corner pointing right
  switch (position) {
    case "first":
      return "rounded-2xl rounded-tl-md"; // Top: sharp top-left
    case "middle":
      return "rounded-r-2xl rounded-l-md"; // Middle: flat on left
    case "last":
      return "rounded-2xl rounded-tl-md"; // Bottom: sharp top-left
    default:
      return "rounded-2xl rounded-tl-md"; // All rounded except top-left
  }
}

/**
 * Determine if metadata (author name, timestamp, role) should be shown.
 *
 * Metadata is hidden for grouped messages to reduce visual clutter.
 *
 * @param position - Position of the comment in its group
 * @returns true if metadata should be displayed
 */
export function shouldShowMetadata(
  position: "single" | "first" | "middle" | "last"
): boolean {
  return position === "single" || position === "first";
}
