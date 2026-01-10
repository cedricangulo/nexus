"use client";

import { UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  approveDeliverableAction,
  requestChangesDeliverableAction,
} from "@/actions/deliverables";
import { UploadEvidenceDialog } from "@/components/member/deliverables/upload-evidence-dialog";
import { DeliverableDetails } from "@/components/shared/deliverables";
import { RequestChangesDialog } from "@/components/team-lead/deliverables/request-changes-dialog";
import { Button } from "@/components/ui/button";
import type { getDeliverableDetail } from "@/lib/data/deliverables";
import { DeliverableStatus } from "@/lib/types";
import { useIsTeamLead } from "@/providers/auth-context-provider";

type DeliverableActionsProps = Awaited<
  ReturnType<typeof getDeliverableDetail>
> & {
  commentSection?: React.ReactNode;
};

export default function DeliverableActions({
  deliverable,
  evidence,
  phase,
  comments,
  commentSection,
}: DeliverableActionsProps) {
  if (!deliverable) {
    return null;
  }

  const isTeamLead = useIsTeamLead();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [requestComment, setRequestComment] = useState("");
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

  const approve = () => {
    startTransition(async () => {
      const result = await approveDeliverableAction({
        deliverableId: deliverable.id,
      });
      if (result.success) {
        toast.success("Deliverable approved");
        router.push(`/deliverables/${deliverable.id}`);
        return;
      }
      toast.error(result.error ?? "Failed to approve deliverable");
    });
  };

  const submitRequestChanges = () => {
    startTransition(async () => {
      const result = await requestChangesDeliverableAction({
        deliverableId: deliverable.id,
        comment: requestComment,
      });

      if (result.success) {
        toast.success("Requested changes");
        setRequestChangesOpen(false);
        setRequestComment("");
        router.push(`/deliverables/${deliverable.id}`);
        return;
      }

      toast.error(result.error ?? "Failed to request changes");
    });
  };

  return (
    <>
      <DeliverableDetails
        commentSection={commentSection}
        controls={{ canReview: isTeamLead, isPending }}
        deliverable={deliverable}
        evidence={evidence}
        onApprove={approve}
        onRequestChanges={() => {
          setRequestChangesOpen(true);
        }}
        phase={phase}
        uploadButton={uploadButton}
      />

      {isTeamLead ? null : (
        <RequestChangesDialog
          comment={requestComment}
          isPending={isPending}
          onCommentChange={setRequestComment}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setRequestChangesOpen(false);
              setRequestComment("");
            }
          }}
          onSubmit={submitRequestChanges}
          open={requestChangesOpen}
        />
      )}

      <UploadEvidenceDialog
        deliverableId={deliverable.id}
        onOpenChange={setUploadOpen}
        onSuccess={handleUploadSuccess}
        open={uploadOpen}
      />
    </>
  );
}
