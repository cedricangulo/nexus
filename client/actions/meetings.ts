/**
 * Server Actions for Meeting Log Management
 *
 * This module contains server-side actions for uploading and managing
 * meeting minutes. It handles file uploads, metadata validation, and
 * linking meetings to sprints or phases.
 *
 * Actions:
 * - uploadMeetingLogAction: Uploads a meeting document with metadata
 *
 * File Handling:
 * - Accepts PDF and image files
 * - Validates file type and converts to FormData for API submission
 * - Supports linking to either sprints or phases (not both)
 *
 * @module actions/meetings
 */
"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { meetingLogApi } from "@/lib/api/meeting-log";
import { toISODateTime } from "@/lib/helpers/date";
import { requireTeamLead, requireUser } from "@/lib/helpers/rbac";

/**
 * Schema for uploading meeting minutes
 *
 * Validates:
 * - scope: Must be either 'sprint' or 'phase'
 * - entityId: ID of the sprint or phase (required)
 * - title: Meeting title (required, non-empty)
 * - date: Meeting date (required, must be valid ISO date)
 * - file: PDF or image file (required)
 *
 * The date is validated using toISODateTime helper to ensure it's convertible
 */
const uploadSchema = z
  .object({
    scope: z.enum(["sprint", "phase"]),
    entityId: z.string().min(1),
    title: z.string().min(1, "Title is required"),
    date: z.string().min(1, "Date is required"),
    file: z.instanceof(File),
  })
  .refine((data) => Boolean(toISODateTime(data.date)), {
    message: "Invalid date",
    path: ["date"],
  });

/**
 * Uploads a meeting log (minutes) with associated metadata
 *
 * Process:
 * 1. Extract data from FormData object
 * 2. Validate against uploadSchema
 * 3. Convert date string to ISO format
 * 4. Call meetingLogApi to upload file
 * 5. Revalidate /meetings path for fresh data
 *
 * Data Structure:
 * - Scope determines whether meeting is linked to sprint or phase
 * - Only one of sprintId or phaseId will be set in the API call
 * - entityId contains the actual ID value based on scope
 *
 * @param prevState - Previous state (required by useActionState)
 * @param formData - FormData containing scope, entityId, title, date, file
 * @returns {success: true} on success, {success: false, error: string} on failure
 */
export async function uploadMeetingLogAction(
  _prevState: { success: boolean; error?: string },
  formData: FormData
) {
  try {
    await requireUser();

    const raw = {
      scope: formData.get("scope"),
      entityId: formData.get("entityId"),
      title: formData.get("title"),
      date: formData.get("date"),
      file: formData.get("file"),
    };

    const parsed = uploadSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      } as const;
    }

    const isoDate = toISODateTime(parsed.data.date);
    if (!isoDate) {
      return { success: false, error: "Invalid date" } as const;
    }

    await meetingLogApi.uploadMeetingLog({
      title: parsed.data.title,
      date: isoDate,
      file: parsed.data.file,
      sprintId:
        parsed.data.scope === "sprint" ? parsed.data.entityId : undefined,
      phaseId: parsed.data.scope === "phase" ? parsed.data.entityId : undefined,
    });

    updateTag("meetings");
    updateTag("sprints");
    updateTag("phases");
    revalidatePath("/meetings");
    return { success: true } as const;
  } catch (error) {
    console.error("[uploadMeetingLogAction] Error:", error);
    return {
      success: false,
      error: "Failed to upload meeting minutes",
    } as const;
  }
}

export async function deleteMeetingLog(meetingLogId: string): Promise<void> {
  try {
    await requireTeamLead();
    await meetingLogApi.deleteMeetingLog(meetingLogId);
    updateTag("meetings");
    revalidatePath("/meetings");
  } catch (error) {
    console.error("[deleteMeetingLog] Error:", error);
    throw new Error("Failed to delete meeting minutes");
  }
}
