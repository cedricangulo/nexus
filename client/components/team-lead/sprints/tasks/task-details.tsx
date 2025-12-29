"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { updateTaskAction, updateTaskStatusAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import type { Task, User } from "@/lib/types";
import { taskDetailSchema } from "@/lib/validation";

type TaskDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task & { assignee?: User | null };
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

  const assigneeOptions = useMemo(
    () =>
      teamMembers
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((u) => ({ value: u.id, label: u.name })),
    [teamMembers]
  );

  const form = useForm<z.infer<typeof taskDetailSchema>>({
    resolver: zodResolver(taskDetailSchema),
    defaultValues: {
      taskId: task.id,
      sprintId,
      title: task.title,
      description: task.description || "",
      status: task.status,
      assigneeId: task.assigneeId || "",
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
      assigneeId: task.assigneeId || "",
      blockReason:
        task.status === "BLOCKED" ? task.lastComment?.content || "" : "",
    });
  }, [open, task, sprintId, form]);

  const currentStatus = form.watch("status");
  const isBlockReasonVisible = currentStatus === "BLOCKED";
  const isMovingToBlocked =
    task.status !== "BLOCKED" && currentStatus === "BLOCKED";

  const onSubmit = (values: z.infer<typeof taskDetailSchema>) => {
    startTransition(async () => {
      const statusChanged = values.status !== task.status;
      const dataChanged =
        values.title !== task.title ||
        values.description !== (task.description || "") ||
        values.assigneeId !== (task.assigneeId || "");

      const previousBlockReason =
        task.status === "BLOCKED" ? task.lastComment?.content || "" : "";
      const blockReasonChanged = values.blockReason !== previousBlockReason;

      const results: Array<{ success: boolean; error?: string }> = [];

      if (statusChanged) {
        const result = await updateTaskStatusAction({
          taskId: values.taskId,
          sprintId: values.sprintId,
          status: values.status,
          comment: values.blockReason || "",
        });
        results.push(result);
      } else if (blockReasonChanged && values.status === "BLOCKED") {
        // If status didn't change but block reason did, update the block reason
        const result = await updateTaskStatusAction({
          taskId: values.taskId,
          sprintId: values.sprintId,
          status: values.status,
          comment: values.blockReason || "",
        });
        results.push(result);
      }

      if (dataChanged) {
        const result = await updateTaskAction({
          taskId: values.taskId,
          sprintId: values.sprintId,
          title: values.title,
          description: values.description,
          assigneeId: values.assigneeId,
        });
        results.push(result);
      }

      if (results.length === 0 && !blockReasonChanged) {
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
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details, status, assignee, or provide a reason if
            blocked.
          </DialogDescription>
        </DialogHeader>

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
                    <Textarea
                      {...field}
                      placeholder="Optional details"
                      rows={3}
                    />
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
                            {option.label}
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
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assigneeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                type="submit"
                variant={isMovingToBlocked ? "destructive" : "default"}
              >
                {isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
