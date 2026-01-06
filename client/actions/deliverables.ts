"use server";

/**
 * Deliverable Server Actions
 *
 * Server actions for deliverable mutations (approve, request changes, etc.)
 */

import { revalidatePath, updateTag } from "next/cache";
import { deliverableApi } from "@/lib/api/deliverable";
import { requireTeamLead } from "@/lib/helpers/rbac";
import { DeliverableStatus } from "@/lib/types";

type ServerActionResponse<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * Approve a deliverable submission
 * Team Lead only action
 */
export async function approveDeliverableAction({
  deliverableId,
}: {
  deliverableId: string;
}): Promise<ServerActionResponse> {
  try {
    await requireTeamLead();

    await deliverableApi.updateDeliverable(deliverableId, {
      status: DeliverableStatus.COMPLETED,
    });

    updateTag("deliverables");
    updateTag(`deliverable-${deliverableId}`);
    revalidatePath("/deliverables");

    return { success: true };
  } catch (error) {
    console.error("[approveDeliverableAction] Error:", error);
    return {
      success: false,
      error: "Failed to approve deliverable",
    };
  }
}

/**
 * Request changes on a deliverable submission
 * Team Lead only action
 */
export async function requestChangesDeliverableAction({
  deliverableId,
  comment,
}: {
  deliverableId: string;
  comment: string;
}): Promise<ServerActionResponse> {
  try {
    await requireTeamLead();

    // Update status back to IN_PROGRESS
    await deliverableApi.updateDeliverable(deliverableId, {
      status: DeliverableStatus.IN_PROGRESS,
    });

    // TODO: Create comment/notification with the feedback
    // This requires a comment API endpoint

    updateTag("deliverables");
    updateTag(`deliverable-${deliverableId}`);
    revalidatePath("/deliverables");

    return { success: true };
  } catch (error) {
    console.error("[requestChangesDeliverableAction] Error:", error);
    return {
      success: false,
      error: "Failed to request changes",
    };
  }
}
