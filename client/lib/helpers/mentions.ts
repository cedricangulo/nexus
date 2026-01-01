/**
 * Mention Utilities
 *
 * Handles mention formatting, parsing, and rendering for comments.
 * Uses the pattern: @[Name](id) for storage and extraction.
 *
 * Example: "@[Bob Smith](550e8400-e29b-41d4-a716-446655440000)"
 */

import type { User } from "@/lib/types";

/**
 * Format a user mention for storage
 * @param name - User's full name
 * @param id - User's UUID from Prisma
 * @returns Formatted mention string: @[Name](id)
 */
export function formatMention(name: string, id: string): string {
  return `@[${name}](${id})`;
}

/**
 * Extract all mentioned user IDs from comment content
 * @param content - Comment text containing mentions
 * @returns Array of unique user UUIDs
 */
export function extractMentionIds(content: string): string[] {
  // Regex to match @[Name](uuid) pattern
  // Captures the UUID inside parentheses
  const mentionRegex = /@\[([^\]]+)\]\(([a-f0-9-]{36})\)/gi;
  const matches = Array.from(content.matchAll(mentionRegex));

  // Extract UUIDs and remove duplicates
  const ids = matches.map((match) => match[2]);
  return Array.from(new Set(ids));
}

/**
 * Parse comment content and return array of text segments and mentions
 * Used for rendering mentions with custom styling
 *
 * @param content - Raw comment text with mention patterns
 * @returns Array of segments: { type: 'text' | 'mention', content: string, userId?: string, userName?: string }
 */
export function parseMentions(content: string): Array<{
  type: "text" | "mention";
  content: string;
  userId?: string;
  userName?: string;
}> {
  const segments: Array<{
    type: "text" | "mention";
    content: string;
    userId?: string;
    userName?: string;
  }> = [];

  const mentionRegex = /@\[([^\]]+)\]\(([a-f0-9-]{36})\)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // biome-ignore lint/suspicious/noAssignInExpressions: Standard regex iteration pattern
  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }

    // Add mention segment
    segments.push({
      type: "mention",
      content: match[1], // User name
      userId: match[2], // User ID
      userName: match[1],
    });

    lastIndex = mentionRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  return segments;
}

/**
 * Get user data formatted for mention dropdown
 * @param users - Array of User objects from API
 * @returns Array formatted for MentionItem component
 */
export function formatUsersForMention(
  users: User[]
): Array<{ id: string; label: string; value: string }> {
  return users.map((user) => ({
    id: user.id,
    label: user.name,
    value: user.email,
  }));
}

/**
 * Validate if a string contains valid mention format
 * @param content - Text to validate
 * @returns true if contains at least one valid mention
 */
export function containsMentions(content: string): boolean {
  const mentionRegex = /@\[([^\]]+)\]\(([a-f0-9-]{36})\)/i;
  return mentionRegex.test(content);
}

/**
 * Convert user-friendly @mentions to storage format with UUIDs
 * Transforms "@Bob Smith" → "@[Bob Smith](uuid)"
 *
 * The Mention component stores mentions with @ prefix as badges/tags.
 * This function converts them to our storage format for database and notifications.
 *
 * @param content - Comment text with friendly @mentions (from Mention component)
 * @param users - Array of users with id, label (name), value (email)
 * @returns Content with storage-format mentions
 *
 * @example
 * convertDisplayToStorage(
 *   "Hey @Bob Smith can you review?",
 *   [{ id: "uuid-123", label: "Bob Smith", value: "bob@example.com" }]
 * )
 * // Returns: "Hey @[Bob Smith](uuid-123) can you review?"
 */
export function convertDisplayToStorage(
  content: string,
  users: Array<{ id: string; label: string; value: string }>
): string {
  let result = content;

  // Sort users by name length (longest first)
  // This prevents "@Bob Smith" being matched by a potential "@Bob" rule
  // Always match the longest/most specific name first
  const sortedUsers = [...users].sort(
    (a, b) => b.label.length - a.label.length
  );

  for (const user of sortedUsers) {
    // Match @Name followed by space, punctuation, or end of string
    // This ensures we capture the full name including spaces
    // The @ is included in the match so we replace the entire mention, preventing double @@
    const escapedName = escapeRegExp(user.label);
    const displayPattern = new RegExp(
      `@${escapedName}(?=\\s|$|[,.!?;:)])`,
      "gi"
    );
    const storageFormat = formatMention(user.label, user.id);
    // Replace the entire @Name with @[Name](uuid) - not adding another @
    result = result.replace(displayPattern, storageFormat);
  }

  return result;
}

/**
 * Convert storage format mentions to display format
 * Transforms "@[Bob Smith](uuid)" → "@Bob Smith"
 *
 * @param content - Comment text with storage-format mentions
 * @returns Content with user-friendly @mentions
 *
 * @example
 * convertStorageToDisplay("Hey @[Bob Smith](uuid-123) can you review?")
 * // Returns: "Hey @Bob Smith can you review?"
 */
export function convertStorageToDisplay(content: string): string {
  // Replace @[Name](uuid) with just @Name
  return content.replace(/@\[([^\]]+)\]\([a-f0-9-]{36}\)/gi, "@$1");
}

/**
 * Escape special regex characters in a string
 * @param str - String to escape
 * @returns Escaped string safe for regex
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
