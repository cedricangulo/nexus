"use client";

import {
  CopyIcon,
  ExternalLinkIcon,
  MoreVertical,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppRole } from "@/auth";
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
import type { MeetingLog } from "@/lib/types";

type MeetingRowActionsProps = {
  meeting: MeetingLog;
  onAction: (actionId: string, meeting: MeetingLog) => Promise<void>;
  isLoading?: boolean;
  currentUserRole: AppRole;
};

export function MeetingRowActions({
  meeting,
  onAction,
  isLoading = false,
  currentUserRole,
}: MeetingRowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isTeamLead = currentUserRole === "teamLead";

  const handleView = () => {
    setDropdownOpen(false);
    onAction("view", meeting);
  };

  const handleCopy = () => {
    setDropdownOpen(false);
    onAction("copy", meeting);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    setIsDeleting(true);

    showPendingActionToast({
      title: "Delete meeting",
      duration: 10_000,
      description: `We'll delete "${meeting.title}" in 10 seconds. Click Cancel to stop this action.`,
      onTimeout: async () => {
        try {
          await onAction("delete", meeting);
          toast.success(`Deleted: ${meeting.title}`);
        } catch (error) {
          console.error("Error deleting meeting:", error);
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

  return (
    <>
      <DropdownMenu onOpenChange={setDropdownOpen} open={dropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Meeting actions"
            // className="h-8 w-8 p-0"
            disabled={isLoading || isDeleting}
            size="icon"
            variant="ghost"
          >
            <MoreVertical aria-hidden="true" className="opacity-60" size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleView}>
            <ExternalLinkIcon size={16} />
            Open minutes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy}>
            <CopyIcon size={16} />
            Copy link
          </DropdownMenuItem>
          {isTeamLead && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                disabled={isDeleting}
                onClick={(e) => {
                  e.preventDefault();
                  setDropdownOpen(false);
                  setShowDeleteDialog(true);
                }}
              >
                <TrashIcon size={16} />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteDialog(false);
          }
        }}
        open={showDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{meeting.title}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              variant="destructive"
            >
              <TrashIcon />
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
