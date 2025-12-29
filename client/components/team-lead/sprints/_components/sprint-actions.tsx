"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteSprintAction } from "@/actions/sprint";
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
import type { Sprint } from "@/lib/types";
import { SprintFormDialog } from "./sprint-form-dialog";

export function CreateSprintButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon className="mr-2 size-4" />
        Create Sprint
      </Button>
      <SprintFormDialog onOpenChange={setOpen} open={open} />
    </>
  );
}

type SprintActionsMenuProps = {
  sprint: Sprint;
  onEditClick: () => void;
};

export function SprintActionsMenu({
  sprint,
  onEditClick,
}: SprintActionsMenuProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const router = useRouter();

  const handleDelete = async (id: string) => {
    const itemToDelete = sprint.goal || `Sprint ${sprint.number}`;

    setShowDeleteDialog(false);
    setIsDeleting(id);

    showPendingActionToast({
      title: "Delete sprint",
      description: `We'll delete "${itemToDelete}" in 10 seconds. Click Cancel to stop this action.`,
      duration: 10_000,
      onTimeout: async () => {
        try {
          const result = await deleteSprintAction(id);

          if (result.success) {
            toast.success(`Deleted: ${itemToDelete}`);
            router.refresh();
          } else {
            toast.error(
              result.error || "Could not delete the sprint. Please try again."
            );
          }
        } catch (error) {
          console.error("Error deleting sprint:", error);
          toast.error("An unexpected error occurred");
        } finally {
          setIsDeleting(null);
        }
      },
      onCancel: () => {
        setIsDeleting(null);
        toast.info("Deletion cancelled, no changes were made.");
      },
    });
  };

  return (
    <>
      <DropdownMenu onOpenChange={setDropdownOpen} open={dropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            variant="ghost"
            size="icon"
          >
            <MoreVertical size={16} />
            <span className="sr-only">Sprint actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setDropdownOpen(false);
              onEditClick();
            }}
          >
            <Pencil className="mr-2 size-4" />
            Edit Sprint
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            disabled={isDeleting !== null}
            onClick={(e) => {
              e.preventDefault();
              setDropdownOpen(false);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="mr-2 size-4" />
            Delete Sprint
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sprint {sprint.number}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The sprint will be marked as
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting !== null}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting !== null}
              onClick={() => handleDelete(sprint.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
