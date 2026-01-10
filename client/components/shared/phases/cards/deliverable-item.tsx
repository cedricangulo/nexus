"use client";

import {
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash,
  Trash2,
} from "lucide-react";
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
import { StatusBadge } from "@/components/ui/status";
import { formatRelativeDueDate, isDateInPast } from "@/lib/helpers/format-date";
import type { Deliverable } from "@/lib/types";
import { cn } from "@/lib/utils";

type DeliverableItemProps = {
  deliverables: Deliverable[];
  onEdit: (deliverable: Deliverable) => void;
  isTeamLead?: boolean;
};

export function DeliverableItem({
  deliverables,
  onEdit,
  isTeamLead = false,
}: DeliverableItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    const deliverable = deliverables.find((d) => d.id === id);
    const itemToDelete = deliverable?.title || "this deliverable";

    setIsDeleting(id);

    showPendingActionToast({
      title: "Delete deliverable",
      description: `We'll delete "${itemToDelete}" in 10 seconds. Click Cancel to stop this action.`,
      duration: 10_000,
      onTimeout: async () => {
        try {
          const result = await deleteDeliverableAction(id);

          if (result.success) {
            toast.success(`Deleted: ${itemToDelete}`);
            router.refresh();
          } else {
            toast.error(
              result.error ||
                "Could not delete the deliverable. Please try again."
            );
          }
        } catch (error) {
          console.error("Error deleting deliverable:", error);
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

  if (deliverables.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground text-sm">
        No deliverables yet.
      </div>
    );
  }

  return (
    <>
      <AlertDialog
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setConfirmDeleteId(null);
          }
        }}
        open={confirmDeleteId !== null}
      >
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
              disabled={confirmDeleteId === null || isDeleting !== null}
              onClick={() => {
                if (!confirmDeleteId) {
                  return;
                }
                const id = confirmDeleteId;
                setConfirmDeleteId(null);
                handleDelete(id);
              }}
              variant="destructive"
            >
              <Trash />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-2">
        {deliverables.map((item) => (
          <div
            className="flex items-start justify-between gap-2 rounded-lg border border-border bg-muted/30 p-2 transition-colors hover:bg-muted/50"
            key={item.id}
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} />
                {item.dueDate && item.status !== "COMPLETED" ? (
                  <span
                    className={cn(
                      "text-muted-foreground text-xs",
                      isDateInPast(item.dueDate) && "text-destructive"
                    )}
                  >
                    {formatRelativeDueDate(item.dueDate)}
                  </span>
                ) : null}
              </div>
              <p className="truncate font-medium text-foreground text-sm">
                {item.title}
              </p>
            </div>

            {isTeamLead ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="shrink-0" size="icon" variant="ghost">
                    <MoreVertical size={16} />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/deliverables/${item.id}`}
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={16} />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Pencil size={16} />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    disabled={isDeleting === item.id}
                    onClick={() => setConfirmDeleteId(item.id)}
                    variant="destructive"
                  >
                    <Trash2 size={16} />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="shrink-0" size="sm" variant="ghost">
                <Link href={`/deliverables/${item.id}`}>
                  <ExternalLink size={16} />
                </Link>
              </Button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
