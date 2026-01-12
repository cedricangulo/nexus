"use client";

import { ExternalLink, MoreVertical, Pencil, Trash, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteDeliverableAction } from "@/actions/phases";
import { showPendingActionToast } from "@/components/shared/pending-action-toast";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeliverableEditDialog } from "@/components/shared/phases/dialogs/edit-deliverable-dialog";
import type { Deliverable } from "@/lib/types";
import { useIsTeamLead } from "@/providers/auth-context-provider";

type Props = {
  deliverable: Deliverable;
};

export function DeliverableActions({ deliverable }: Props) {
  const isTeamLead = useIsTeamLead();
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [editDeliverableOpen, setEditDeliverableOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);

    showPendingActionToast({
      title: "Delete deliverable",
      description: `We'll delete "${deliverable.title}" in 10 seconds. Click Cancel to stop this action.`,
      duration: 10_000,
      onTimeout: async () => {
        try {
          const result = await deleteDeliverableAction(deliverable.id);

          if (result.success) {
            toast.success(`Deleted: ${deliverable.title}`);
            router.refresh();
          } else {
            toast.error(
              result.error || "Could not delete the deliverable. Please try again."
            );
          }
        } catch (error) {
          console.error("Error deleting deliverable:", error);
          toast.error("An unexpected error occurred");
        } finally {
          setIsDeleting(false);
        }
      },
      onCancel: () => {
        setIsDeleting(false);
        toast.info("Deletion cancelled, no changes were made.");
      },
    });
  };

  if (!isTeamLead) {
    return (
      <Button asChild className="shrink-0" size="sm" variant="ghost">
        <Link href={`/deliverables/${deliverable.id}`}>
          <ExternalLink size={16} />
        </Link>
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="shrink-0" size="icon" variant="ghost">
            <MoreVertical size={16} />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/deliverables/${deliverable.id}`} rel="noopener noreferrer">
              <ExternalLink size={16} />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setSelectedDeliverable(deliverable);
            setEditDeliverableOpen(true);
          }}>
            <Pencil size={16} />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            disabled={isDeleting}
            onClick={() => setConfirmDeleteOpen(true)}
            variant="destructive"
          >
            <Trash2 size={16} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete deliverable</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this deliverable?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => {
                setConfirmDeleteOpen(false);
                handleDelete();
              }}
              variant="destructive"
            >
              <Trash />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedDeliverable?.id === deliverable.id && (
        <DeliverableEditDialog
          deliverable={selectedDeliverable}
          open={editDeliverableOpen}
          onOpenChange={setEditDeliverableOpen}
        />
      )}
    </>
  );
}
