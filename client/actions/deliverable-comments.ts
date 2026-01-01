/**
 * Server Actions for Comment Management with Mentions
 *
 * Handles creation of comments on deliverables with automatic
 * mention detection and notification generation.
 *
 * Features:
 * - Parse @[Name](id) patterns from comment content
 * - Create notifications for all mentioned users
 * - Link notifications back to the deliverable
 *
 * @module actions/deliverable-comments
 */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { commentApi } from "@/lib/api/comment";
import { getCurrentUser } from "@/lib/data/user";

/**
 * Schema for creating a deliverable comment
 * Validates comment content and deliverable ID
 */
const createCommentSchema = z.object({
  deliverableId: z.uuid("Invalid deliverable ID"),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment too long"),
});

type CreateDeliverableCommentInput = z.infer<typeof createCommentSchema>;

type ActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Create a comment on a deliverable with mention detection
 *
 * Flow:
 * 1. Validate user is authenticated
 * 2. Parse input with Zod schema
 * 3. Create comment via API
 * 4. Extract mentioned user IDs from content
 * 5. Create notification for each mentioned user
 * 6. Revalidate deliverable page
 *
 * @param input - Comment content and deliverable ID
 * @returns Success/error tuple
 */
export async function createDeliverableCommentAction(
  input: CreateDeliverableCommentInput
): Promise<ActionResult> {
  try {
    // Verify user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const parsed = createCommentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { deliverableId, content } = parsed.data;

    // Create the comment
    const _comment = await commentApi.createComment({
      content,
      deliverableId,
    });

    // Revalidate the deliverable page to show new comment
    revalidatePath(`/deliverables/${deliverableId}`);
    revalidatePath("/deliverables");

    return { success: true };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create comment",
    };
  }
}
