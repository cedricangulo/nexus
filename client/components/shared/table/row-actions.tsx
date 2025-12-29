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

    onAction(pendingAction.id, row);
    setIsAlertOpen(false);
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
                  className={`cursor-pointer gap-2 ${
                    action.variant === "destructive" ? "text-red-600" : ""
                  }`}
                  disabled={isLoading}
                  onClick={() => handleMenuAction(action)}
                >
                  <Icon aria-hidden="true" className="opacity-60" size={16} />
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
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={handleConfirm}>
              {isLoading ? "Working..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
