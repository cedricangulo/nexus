"use client";

import {
  ArchiveRestore,
  Check,
  ExternalLink,
  Eye,
  type LucideIcon,
  MoreVertical,
  Trash,
  X,
} from "lucide-react";
import { useState } from "react";
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
import type { ActionConfig, GenericRowActionsProps } from "./types";

const defaultActionIcons: Record<string, LucideIcon> = {
  view: Eye,
  open: ExternalLink,
  delete: Trash,
  restore: ArchiveRestore,
  approve: Check,
  reject: X,
};

function getActionDescription(label: string): string {
  const descriptions: Record<string, string> = {
    delete: "This item will be permanently removed.",
    restore: "This item will be restored and become active again.",
    approve: "You are about to approve this item.",
    reject: "You are about to reject this item.",
  };

  return descriptions[label.toLowerCase()] || "This action cannot be undone.";
}

export function GenericRowActions<T>({
  row,
  actions,
  onAction,
  isLoading = false,
}: GenericRowActionsProps<T>) {
  const [pendingAction, setPendingAction] = useState<ActionConfig | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleMenuAction = (action: ActionConfig) => {
    if (isLoading) {
      return;
    }

    if (action.variant === "destructive") {
      setPendingAction(action);
      setIsAlertOpen(true);
      return;
    }

    onAction(action.id, row);
  };

  const _handleDialogClose = () => {
    setIsAlertOpen(false);
  };

  const handleConfirm = () => {
    if (!pendingAction) {
      return;
    }

    // Close alert dialog first
    setIsAlertOpen(false);

    // Show pending action toast with countdown
    showPendingActionToast({
      title: `${pendingAction.label} in progress`,
      description: "This action will complete shortly. Click cancel to undo.",
      duration: 5000,
      onTimeout: async () => {
        onAction(pendingAction.id, row);
        setPendingAction(null);
      },
      onCancel: () => {
        setPendingAction(null);
      },
    });
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Row actions"
            className="h-8 w-8 p-0"
            disabled={isLoading}
            size="icon"
            variant="ghost"
          >
            <MoreVertical aria-hidden="true" className="opacity-60" size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" suppressHydrationWarning>
          {actions.map((action, index) => {
            const Icon = action.icon || defaultActionIcons[action.id] || Eye;

            return (
              <div key={action.id}>
                <DropdownMenuItem
                  className={`cursor-pointer ${
                    action.variant === "destructive" ? "text-destructive" : ""
                  }`}
                  disabled={isLoading}
                  onClick={() => handleMenuAction(action)}
                >
                  <Icon aria-hidden="true" size={16} />
                  <span>{action.label}</span>
                </DropdownMenuItem>
                {action.showDividerAfter && index < actions.length - 1 && (
                  <DropdownMenuSeparator aria-hidden="true" />
                )}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setIsAlertOpen(false);
            setPendingAction(null);
          }
        }}
        open={isAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {`Confirm ${pendingAction?.label}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction && getActionDescription(pendingAction.label)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={handleConfirm}
              variant={
                pendingAction?.variant === "destructive" ? "destructive" : null
              }
            >
              {isLoading ? (
                "Working..."
              ) : (
                <>
                  {pendingAction?.label === "Delete" ? <Trash /> : <Check />}{" "}
                  {pendingAction?.label}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
