"use client";

import { approveDeliverableAction, requestChangesDeliverableAction } from "@/actions/deliverables";
import { showPendingActionToast } from "@/components/shared/pending-action-toast";
import { RequestChangesDialog } from "@/components/shared/deliverables-details/request-changes-dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { DeliverableStatus } from "@/lib/types/models";
import { useIsTeamLead } from "@/providers/auth-context-provider";
import { Check, ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type Props = {
  id: string;
  title: string;
  status: DeliverableStatus;
}

export default function HeaderButtons({ id, title, status }: Props) {

  const isTeamLead = useIsTeamLead();
  
  // Only show buttons if the status is review and user is team lead
  const canReview = status === DeliverableStatus.REVIEW && isTeamLead;

  // if (!canReview) {
  //   return null;
  // }

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [requestComment, setRequestComment] = useState("");

  const confirmApproveDeliverable = (id: string) => {
    showPendingActionToast({
      title: "Approve Deliverable",
      description: `We'll approve "${title}" in 10 seconds. Click Cancel to stop this action.`,
      duration: 10_000,
      onTimeout: async () => {
        try {
          const result = await approveDeliverableAction({ deliverableId: id });

          if (result.success) {
            toast.success(`Approved: ${title}`);
            router.refresh();
          } else {
            toast.error(
              result.error || "Failed to approve deliverable. Please try again."
            );
          }
        } catch (error) {
          console.error("Error approving deliverable:", error);
          toast.error("An unexpected error occurred");
        } finally {
          startTransition(() => { router.refresh(); })
        }
      },
      onCancel: () => {
        // setIsPending(false);
        toast.info("Deletion cancelled, no changes were made.");
      },
    });
  };

  const submitRequestChanges = () => {
    startTransition(async () => {

      const isLoading = toast.loading("Requesting changes...");

      const result = await requestChangesDeliverableAction({
        deliverableId: id,
        comment: requestComment,
      });

      toast.dismiss(isLoading);

      if (result.success) {
        toast.success("Requested changes");
        setRequestChangesOpen(false);
        setRequestComment("");
        router.push(`/deliverables/${id}`);
        return;
      }

      toast.error(result.error ?? "Failed to request changes");
    });
  };

  return (
		<>
      {!canReview ? null : (
        <div className="flex flex-col gap-4 sm:flex-row">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="gap-2 w-fit"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Spinner />
                    Review
                  </>
                ) : (
                  <>
                    <Check />
                    Review
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRequestChangesOpen(true)}>
                Request Changes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setApproveOpen(true)}>Approve</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

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

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setApproveOpen(false);
          }
        }}
        open={approveOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Deliverable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this deliverable?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={approveOpen === null || isPending}
              onClick={() => {
                if (!approveOpen) {
                  return;
                }
                setApproveOpen(false);
                confirmApproveDeliverable(id);
              }}
            >
              <Check />
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
		</>
	);
}