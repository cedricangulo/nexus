"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateTaskAction, updateTaskStatusAction } from "@/actions/tasks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Task, TaskStatus } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "DONE", label: "Done" },
] as const;

export type MemberTaskDetailDialogProps = {
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sprintId: string;
};

/**
 * Member-specific task detail dialog
 * Shows task information and allows editing title, description, and status
 * Block reason required when status is BLOCKED
 */
export function MemberTaskDetailDialog({
  task,
  isOpen,
  onOpenChange,
  sprintId,
}: MemberTaskDetailDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: (task?.status || "TODO") as TaskStatus,
    blockReason: "",
  });

  // Update form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        blockReason:
          task.status === "BLOCKED"
            ? (task as Task & { lastComment?: { content: string } }).lastComment
                ?.content || ""
            : "",
      });
    }
  }, [task]);

  if (!task) {
    return null;
  }

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (formData.status === "BLOCKED" && !formData.blockReason.trim()) {
      toast.error("Please provide a reason for blocking");
      return;
    }

    startTransition(async () => {
      try {
        const results: Array<{ success: boolean; error?: string }> = [];

        // Update status if it changed
        if (formData.status !== task.status) {
          const result = await updateTaskStatusAction({
            taskId: task.id,
            sprintId,
            status: formData.status,
            comment: formData.blockReason || undefined,
          });
          results.push(result);
        }

        // Update title/description if they changed
        if (
          formData.title !== task.title ||
          formData.description !== (task.description || "")
        ) {
          const result = await updateTaskAction({
            taskId: task.id,
            sprintId,
            title: formData.title,
            description: formData.description,
          });
          results.push(result);
        }

        if (results.length === 0) {
          toast.info("No changes to save");
          onOpenChange(false);
          return;
        }

        const allSucceeded = results.every((r) => r.success);
        if (allSucceeded) {
          toast.success("Task updated");
          onOpenChange(false);
          router.refresh();
        } else {
          const errors = results
            .filter((r) => !r.success)
            .map((r) => r.error)
            .join(", ");
          toast.error(errors || "Failed to update task");
        }
      } catch (_error) {
        toast.error("Failed to update task");
      }
    });
  };

  const formContent = (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label className="font-medium text-sm" htmlFor="title">
          Title
        </Label>
        <Input
          disabled={isPending}
          id="title"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Task title"
          value={formData.title}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="font-medium text-sm" htmlFor="description">
          Description
        </Label>
        <Textarea
          disabled={isPending}
          id="description"
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          placeholder="Add a description..."
          rows={3}
          value={formData.description}
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label className="font-medium text-sm" htmlFor="status">
          Status
        </Label>
        <Select
          disabled={isPending}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              status: value as TaskStatus,
            }))
          }
          value={formData.status}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <StatusBadge status={option.value} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Block Reason (only shown when status is BLOCKED) */}
      {formData.status === "BLOCKED" && (
        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="blockReason">
            Reason for Block
          </Label>
          <Textarea
            disabled={isPending}
            id="blockReason"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                blockReason: e.target.value,
              }))
            }
            placeholder="Explain why this task is blocked..."
            rows={3}
            value={formData.blockReason}
          />
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={isOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Task Details</DrawerTitle>
            <DrawerDescription>
              View and edit your task information
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4">{formContent}</div>

          <DrawerFooter>
            <Button
              disabled={
                isPending ||
                !formData.title.trim() ||
                (formData.status === "BLOCKED" && !formData.blockReason.trim())
              }
              onClick={handleSave}
            >
              {isPending ? (
                <>
                  <Spinner /> Save Changes
                </>
              ) : (
                <>
                  <Save /> Save Changes
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button disabled={isPending} variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>
            View and edit your task information
          </DialogDescription>
        </DialogHeader>

        {formContent}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            className="flex-1"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={
              isPending ||
              !formData.title.trim() ||
              (formData.status === "BLOCKED" && !formData.blockReason.trim())
            }
            onClick={handleSave}
          >
            {isPending ? (
              <>
                <Spinner /> Save Changes
              </>
            ) : (
              <>
                <Save /> Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
