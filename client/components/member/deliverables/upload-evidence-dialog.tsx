"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import {
  uploadEvidenceAction,
  uploadEvidenceLinkAction,
} from "@/actions/evidence";
import { AutoUploadDialog } from "@/components/shared/dialogs/auto-upload-dialog";

type UploadEvidenceDialogProps = {
  deliverableId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function UploadEvidenceDialog({
  deliverableId,
  open,
  onOpenChange,
  onSuccess,
}: UploadEvidenceDialogProps) {
  const maxSize = 10 * 1024 * 1024; // 10MB

  const handleUpload = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) {
        return;
      }

      const formData = new FormData();
      formData.append("deliverableId", deliverableId);
      formData.append("file", file);

      const loadingToast = toast.loading("Uploading evidence...");

      const result = await uploadEvidenceAction({ success: false }, formData);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success("Evidence uploaded successfully", {
          description:
            "Deliverable status changed to Review. Add comments below if needed.",
        });
        onSuccess?.();
      } else {
        throw new Error(result.error || "Failed to upload evidence");
      }
    },
    [deliverableId, onSuccess]
  );

  const handleLinkSubmit = useCallback(
    async (link: string, fileName?: string) => {
      const formData = new FormData();
      formData.append("deliverableId", deliverableId);
      formData.append("link", link);
      // Only append fileName if provided and not empty after trim
      if (fileName?.trim()) {
        formData.append("fileName", fileName.trim());
      }

      const loadingToast = toast.loading("Submitting evidence link...");

      const result = await uploadEvidenceLinkAction(
        { success: false },
        formData
      );

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success("Evidence link submitted successfully", {
          description:
            "Deliverable status changed to Review. Add comments below if needed.",
        });
        onSuccess?.();
      } else {
        throw new Error(result.error || "Failed to submit evidence link");
      }
    },
    [deliverableId, onSuccess]
  );

  return (
    <AutoUploadDialog
      config={{
        accept: ".pdf,.jpg,.jpeg,.png,.gif,.webp",
        maxSize,
        maxFiles: 1,
        requiresConfirmation: true,
      }}
      content={{
        title: "Upload Evidence",
        description:
          "Select a file or submit a link to fulfill this deliverable. The status will change to Review after submission.",
      }}
      control={{ open, onOpenChange }}
      features={{
        showLinkTab: true,
        onLinkSubmit: handleLinkSubmit,
      }}
      handlers={{
        onUpload: handleUpload,
        onSuccess,
      }}
    />
  );
}
