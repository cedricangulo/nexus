"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteSprintAction } from "@/actions/sprint";
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

type SprintActionsMenuProps = {
  sprint: Sprint;
  onEditClick: () => void;
};

export function SprintActionsMenu({
  sprint,
  onEditClick,
}: SprintActionsMenuProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSprintAction(sprint.id);
      if (!result.success) {
        alert(result.error || "Failed to delete sprint");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button onClick={(e) => e.preventDefault()} variant="ghost">
            <MoreVertical size={16} />
            <span className="sr-only">Sprint actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              onEditClick();
            }}
          >
            <Pencil size={16} />
            Edit Sprint
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault();
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 size={16} />
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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
