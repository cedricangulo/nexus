"use server";

import { revalidatePath } from "next/cache";
import { evidenceApi } from "@/lib/api/evidence";
import { requireUser } from "@/lib/helpers/rbac";

type UploadEvidenceState = {
  success: boolean;
  error?: string;
};

/**
 * Upload evidence for a deliverable (Team Member action)
 *
 * Workflow:
 * 1. Validate user is authenticated
 * 2. Extract deliverableId and file from FormData
 * 3. Upload evidence file to server (Cloudinary)
 * 4. Update deliverable status to REVIEW
 * 5. Revalidate paths for immediate UI update
 *
 * @param _prevState - Previous state (unused, required by useFormState)
 * @param formData - Form data containing deliverableId and file
 * @returns Success/error state
 */
export async function uploadEvidenceAction(
  _prevState: UploadEvidenceState,
  formData: FormData
): Promise<UploadEvidenceState> {
  try {
    // Security: Require authenticated user
    await requireUser();

    // Extract form data
    const deliverableId = formData.get("deliverableId") as string;
    const file = formData.get("file") as File;

    // Validate required fields
    if (!deliverableId) {
      return { success: false, error: "Deliverable ID is required" };
    }

    if (!file) {
      return { success: false, error: "File is required" };
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size exceeds 10MB limit",
      };
    }

    // Validate file type (PDF and images only)
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only PDF and images (JPEG, PNG, GIF, WEBP) are allowed.",
      };
    }

    // Upload evidence to server
    await evidenceApi.uploadEvidence(deliverableId, file);

    // Note: Deliverable status is automatically updated to REVIEW on the server
    // when evidence is uploaded. No need for separate API call.

    // Revalidate paths for immediate UI update
    revalidatePath("/deliverables");
    revalidatePath(`/deliverables/${deliverableId}`);
    revalidatePath("/phases");

    return { success: true };
  } catch (error) {
    console.error("[uploadEvidenceAction] Error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message || "Failed to upload evidence",
      };
    }

    return {
      success: false,
      error: "Failed to upload evidence. Please try again.",
    };
  }
}
