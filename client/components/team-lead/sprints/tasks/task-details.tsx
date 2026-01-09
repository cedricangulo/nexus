"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { updateTaskAction, updateTaskStatusAction } from "@/actions/tasks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import { Badge } from "@/components/ui/badge";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Task, User } from "@/lib/types";
import { taskDetailSchema } from "@/lib/validation";

type TaskDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  sprintId: string;
  teamMembers: User[];
};

const statusOptions = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "DONE", label: "Done" },
] as const;

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  sprintId,
  teamMembers,
}: TaskDetailDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isMobile = useIsMobile();

  const assigneeOptions = useMemo(
    () =>
      teamMembers
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((u) => ({ value: u.id, label: u.name })),
    [teamMembers]
  );

  // Extract assignee IDs from task.assignees
  const initialAssigneeIds = useMemo(
    () => task.assignees?.map((a) => a.id) || [],
    [task.assignees]
  );

  const form = useForm<z.infer<typeof taskDetailSchema>>({
    resolver: zodResolver(taskDetailSchema),
    defaultValues: {
      taskId: task.id,
      sprintId,
      title: task.title,
      description: task.description || "",
      status: task.status,
      assigneeIds: initialAssigneeIds,
      blockReason:
        task.status === "BLOCKED" ? task.lastComment?.content || "" : "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      taskId: task.id,
      sprintId,
      title: task.title,
      description: task.description || "",
      status: task.status,
      assigneeIds: task.assignees?.map((a) => a.id) || [],
      blockReason:
        task.status === "BLOCKED" ? task.lastComment?.content || "" : "",
    });
  }, [open, task, sprintId, form]);

  const currentStatus = form.watch("status");
  const selectedAssigneeIds = form.watch("assigneeIds") || [];
  const isBlockReasonVisible = currentStatus === "BLOCKED";
  const isMovingToBlocked =
    task.status !== "BLOCKED" && currentStatus === "BLOCKED";

  const handleAddAssignee = (userId: string) => {
    if (!selectedAssigneeIds.includes(userId)) {
      form.setValue("assigneeIds", [...selectedAssigneeIds, userId]);
    }
  };

  const handleRemoveAssignee = (userId: string) => {
    form.setValue(
      "assigneeIds",
      selectedAssigneeIds.filter((id) => id !== userId)
    );
  };

  const availableAssignees = assigneeOptions.filter(
    (o) => !selectedAssigneeIds.includes(o.value)
  );

  /**
   * Detect what fields have changed compared to original task
   */
  const detectChanges = (values: z.infer<typeof taskDetailSchema>) => {
    const statusChanged = values.status !== task.status;
    const currentAssigneeIds = task.assignees?.map((a) => a.id) || [];
    const assigneesChanged =
      JSON.stringify(values.assigneeIds?.sort()) !==
      JSON.stringify(currentAssigneeIds.sort());
    const dataChanged =
      values.title !== task.title ||
      values.description !== (task.description || "") ||
      assigneesChanged;

    const previousBlockReason =
      task.status === "BLOCKED" ? task.lastComment?.content || "" : "";
    const blockReasonChanged = values.blockReason !== previousBlockReason;

    return { statusChanged, assigneesChanged, dataChanged, blockReasonChanged };
  };

  /**
   * Build list of API calls needed based on detected changes
   */
  const buildUpdateCalls = (values: z.infer<typeof taskDetailSchema>) => {
    const { statusChanged, dataChanged, blockReasonChanged } = detectChanges(values);
    const calls: Array<Promise<{ success: boolean; error?: string }>> = [];

    // Update status or block reason
    if (statusChanged || (blockReasonChanged && values.status === "BLOCKED")) {
      calls.push(
        updateTaskStatusAction({
          taskId: values.taskId,
          sprintId: values.sprintId,
          status: values.status,
          comment: values.blockReason || "",
        })
      );
    }

    // Update task data (title, description, assignees)
    if (dataChanged) {
      calls.push(
        updateTaskAction({
          taskId: values.taskId,
          sprintId: values.sprintId,
          title: values.title,
          description: values.description,
          assigneeIds: values.assigneeIds,
        })
      );
    }

    return calls;
  };

  const onSubmit = (values: z.infer<typeof taskDetailSchema>) => {
    startTransition(async () => {
      const { blockReasonChanged } = detectChanges(values);
      const updateCalls = buildUpdateCalls(values);

      // No changes detected
      if (updateCalls.length === 0 && !blockReasonChanged) {
        toast.info("No changes to save");
        onOpenChange(false);
        return;
      }

      const results = await Promise.all(updateCalls);

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
    });
  };

  const formContent = (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Task title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Optional details" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <StatusBadge status={option.value} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigneeIds"
            render={() => (
              <FormItem>
                <FormLabel>Assignees</FormLabel>
                {selectedAssigneeIds.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {selectedAssigneeIds.map((id) => {
                      const user = teamMembers.find((u) => u.id === id);
                      return (
                        <Badge
                          className="flex items-center gap-1"
                          key={id}
                          variant="secondary"
                        >
                          {user?.name || "Unknown"}
                          <button
                            className="ml-1 rounded-full hover:bg-muted"
                            onClick={() => handleRemoveAssignee(id)}
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {availableAssignees.length > 0 && (
                  <Select onValueChange={handleAddAssignee} value="">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Add assignee..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableAssignees.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isBlockReasonVisible ? (
          <FormField
            control={form.control}
            name="blockReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Block</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Explain why this task is blocked"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Task</DrawerTitle>
            <DrawerDescription>
              Update task details, status, assignees, or provide a reason if
              blocked.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4">{formContent}</div>

          <DrawerFooter>
            <Button
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
              type="button"
              variant={isMovingToBlocked ? "destructive" : "default"}
            >
              {isPending ? "Updating..." : "Update"}
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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details, status, assignees, or provide a reason if
            blocked.
          </DialogDescription>
        </DialogHeader>

        {formContent}

        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
            type="button"
            variant={isMovingToBlocked ? "destructive" : "default"}
          >
            {isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
