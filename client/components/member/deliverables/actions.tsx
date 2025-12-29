"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeliverableDetails } from "@/components/shared/deliverables";
import { UploadEvidenceDialog } from "./upload-evidence-dialog";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import type { Comment, Deliverable, Evidence, Phase } from "@/lib/types";
import { DeliverableStatus } from "@/lib/types";

type MemberDeliverableActionsProps = {
  deliverable: Deliverable;
  evidence: Evidence[];
  phase?: Phase;
  comments: Comment[];
  teamMembers: Array<{ id: string; label: string; value: string }>;
  user?: { id?: string; role?: string };
};

export default function MemberDeliverableActions({
  deliverable,
  evidence,
  phase,
  comments,
  teamMembers,
  user,
}: MemberDeliverableActionsProps) {
  const router = useRouter();
  const [uploadOpen, setUploadOpen] = useState(false);

  // Show upload button when deliverable is NOT_STARTED or IN_PROGRESS
  const canUpload =
    deliverable.status === DeliverableStatus.NOT_STARTED ||
    deliverable.status === DeliverableStatus.IN_PROGRESS;

  const uploadButton = canUpload ? (
    <Button onClick={() => setUploadOpen(true)}>
      <UploadIcon className="size-4" />
      Upload Evidence
    </Button>
  ) : null;

  const handleUploadSuccess = () => {
    // Refresh to show new evidence and updated status
    router.refresh();
  };

  return (
    <>
      <DeliverableDetails
        comments={comments}
        controls={{ canReview: false, isPending: false }}
        deliverable={deliverable}
        evidence={evidence}
        phase={phase}
        teamMembers={teamMembers}
        uploadButton={uploadButton}
        user={user}
      />

      <UploadEvidenceDialog
        deliverableId={deliverable.id}
        onOpenChange={setUploadOpen}
        onSuccess={handleUploadSuccess}
        open={uploadOpen}
      />
    </>
  );
}
