"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getErrorMessage } from "@/lib/api/error-handler";
import { sprintApi } from "@/lib/api/sprint";
import { cleanDateInput, toISODateTime } from "@/lib/helpers/date";
import { requireTeamLead } from "@/lib/helpers/rbac";
import { createSprintSchema } from "@/lib/validation";

export type UpdateSprintActionInput = {
  id: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
};

export async function createSprintAction(input: unknown) {
  try {
    await requireTeamLead();
    const parsed = createSprintSchema.parse(input);

    // Dates are required by schema, so they're guaranteed to be non-empty strings
    const startDate = cleanDateInput(parsed.startDate);
    const endDate = cleanDateInput(parsed.endDate);

    if (!(startDate && endDate)) {
      throw new Error("Start date and end date are required");
    }

    const transformed = {
      goal: parsed.goal || "",
      startDate: toISODateTime(startDate) as string,
      endDate: toISODateTime(endDate) as string,
    };

    await sprintApi.createSprint(transformed);
    updateTag("sprints");
    updateTag("meetings");
    revalidatePath("/sprints");

    return { success: true } as const;
  } catch (error) {
    console.error("[createSprintAction] Error:", error);
    return { success: false, error: getErrorMessage(error) } as const;
  }
}

export async function updateSprintAction(input: UpdateSprintActionInput) {
  try {
    await requireTeamLead();

    const parsed = createSprintSchema.parse({
      goal: input.goal,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    const startDate = cleanDateInput(parsed.startDate);
    const endDate = cleanDateInput(parsed.endDate);

    if (!(startDate && endDate)) {
      throw new Error("Start date and end date are required");
    }

    const transformed = {
      goal: parsed.goal || "",
      startDate: toISODateTime(startDate) as string,
      endDate: toISODateTime(endDate) as string,
    };

    await sprintApi.updateSprint(input.id, transformed);
    updateTag("sprints");
    updateTag("meetings");
    revalidatePath("/sprints");

    return { success: true } as const;
  } catch (error) {
    console.error("[updateSprintAction] Error:", error);
    return { success: false, error: getErrorMessage(error) } as const;
  }
}

export async function deleteSprintAction(id: string) {
  try {
    await requireTeamLead();
    await sprintApi.deleteSprint(id);
    updateTag("sprints");
    updateTag("meetings");
    revalidatePath("/sprints");

    return { success: true } as const;
  } catch (error) {
    console.error("[deleteSprintAction] Error:", error);
    return { success: false, error: "Failed to delete sprint" } as const;
  }
}
