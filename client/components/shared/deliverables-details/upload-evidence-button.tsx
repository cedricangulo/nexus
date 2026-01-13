"use client"

import { UploadEvidenceDialog } from "@/components/shared/deliverables-details/upload-evidence-dialog";
import { Button } from "@/components/ui/button";
import { DeliverableStatus } from "@/lib/types/models";
import { UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
  status: DeliverableStatus;
}

export default function UploadEvidenceButton({ id, status }: Props) {

  const canUpload =
      status === DeliverableStatus.NOT_STARTED ||
      status === DeliverableStatus.IN_PROGRESS;

  if (!canUpload) {
    return null;
  }

  const router = useRouter();

  const [uploadOpen, setUploadOpen] = useState(false);

  const handleUploadSuccess = () => {
  // Refresh to show new evidence and updated status
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setUploadOpen(true)}>
        <UploadIcon className="size-4" />
        Upload Evidence
      </Button>

      <UploadEvidenceDialog
        deliverableId={id}
        onOpenChange={setUploadOpen}
        onSuccess={handleUploadSuccess}
        open={uploadOpen}
      />
    </>
  )
}