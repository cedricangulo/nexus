"use client";

import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import { uploadEvidenceAction } from "@/actions/evidence";
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
  const [_isPending, startTransition] = useTransition();
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

      startTransition(async () => {
        const result = await uploadEvidenceAction({ success: false }, formData);

        toast.dismiss(loadingToast);

        if (result.success) {
          toast.success("Evidence uploaded successfully", {
            description:
              "Deliverable status changed to Review. Add comments below if needed.",
          });
          onSuccess?.();
        } else {
          toast.error(result.error || "Failed to upload evidence");
          throw new Error(result.error);
        }
      });
    },
    [deliverableId, onSuccess]
  );

  return (
    <AutoUploadDialog
      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
      description="Select a file to fulfill this deliverable. Click Upload to confirm. The status will change to Review after upload."
      maxFiles={1}
      maxSize={maxSize}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      onUpload={handleUpload}
      open={open}
      requiresConfirmation={true}
      title="Upload Evidence"
    />
  );
}
