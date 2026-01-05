"use server";

/**
 * Phase & Deliverable Actions
 *
 * Simple CRUD operations for individual phase and deliverable updates.
 * Used in the phases management page for direct user actions.
 *
 * For bulk methodology configuration syncing, see phase-deliverables.ts
 */

import { revalidatePath, updateTag } from "next/cache";
import type { z } from "zod";

import { deliverableApi } from "@/lib/api/deliverable";
import { phaseApi } from "@/lib/api/phase";
import { cleanDateInput, toISODateTime } from "@/lib/helpers/date";
import { requireTeamLead } from "@/lib/helpers/rbac";
import {
  createDeliverableSchema,
  updateDeliverableSchema,
  updatePhaseSchema,
} from "@/lib/validation";

export async function updatePhaseAction(
  input: z.infer<typeof updatePhaseSchema>
) {
  try {
    await requireTeamLead();
    const { id, ...data } = updatePhaseSchema.parse(input);

    // Clean and transform dates to ISO datetime format for server
    const transformedData = {
      ...data,
      startDate: toISODateTime(cleanDateInput(data.startDate)),
      endDate: toISODateTime(cleanDateInput(data.endDate)),
    };

    await phaseApi.updatePhase(id, transformedData);
    updateTag("phases");
    updateTag(`phase-${id}`);
    revalidatePath("/phases");
    return { success: true };
  } catch (error) {
    console.error("[updatePhaseAction] Error:", error);
    return { success: false, error: "Failed to update phase" };
  }
}

export async function createDeliverableAction(
  input: z.infer<typeof createDeliverableSchema>
) {
  try {
    await requireTeamLead();
    const data = createDeliverableSchema.parse(input);

    // Clean and transform date to ISO datetime format for server
    const transformedData = {
      ...data,
      dueDate: toISODateTime(cleanDateInput(data.dueDate)),
    };

    await deliverableApi.createDeliverable(transformedData);
    updateTag("phases");
    updateTag("deliverables");
    revalidatePath("/phases");
    return { success: true };
  } catch (error) {
    console.error("[createDeliverableAction] Error:", error);
    return { success: false, error: "Failed to create deliverable" };
  }
}

export async function updateDeliverableAction(
  input: z.infer<typeof updateDeliverableSchema>
) {
  try {
    await requireTeamLead();
    const { id, ...data } = updateDeliverableSchema.parse(input);

    // Clean and transform date to ISO datetime format for server
    const transformedData = {
      ...data,
      dueDate: toISODateTime(cleanDateInput(data.dueDate)),
    };

    await deliverableApi.updateDeliverable(id, transformedData);
    updateTag("phases");
    updateTag("deliverables");
    revalidatePath("/phases");
    return { success: true };
  } catch (error) {
    console.error("[updateDeliverableAction] Error:", error);
    return { success: false, error: "Failed to update deliverable" };
  }
}

export async function deleteDeliverableAction(id: string) {
  try {
    await requireTeamLead();
    await deliverableApi.deleteDeliverable(id);
    updateTag("phases");
    updateTag("deliverables");
    revalidatePath("/phases");
    return { success: true };
  } catch (error) {
    console.error("[deleteDeliverableAction] Error:", error);
    return { success: false, error: "Failed to delete deliverable" };
  }
}
