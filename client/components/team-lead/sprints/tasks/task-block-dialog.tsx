"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { updateTaskStatusAction } from "@/actions/tasks";
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
import { Textarea } from "@/components/ui/textarea";
import type { TaskStatus } from "@/lib/types";
import { updateTaskStatusSchema } from "@/lib/validation";

type TaskBlockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  sprintId: string;
  targetStatus: TaskStatus;
  currentComment?: string;
  onSuccess?: () => void;
};

export function TaskBlockDialog({
  open,
  onOpenChange,
  taskId,
  sprintId,
  targetStatus,
  currentComment,
  onSuccess,
}: TaskBlockDialogProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof updateTaskStatusSchema>>({
    resolver: zodResolver(updateTaskStatusSchema),
    defaultValues: {
      taskId: "",
      sprintId,
      status: targetStatus,
      comment: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      taskId: taskId ?? "",
      sprintId,
      status: targetStatus,
      comment: currentComment || "",
    });
  }, [open, taskId, sprintId, targetStatus, currentComment, form]);

  const onSubmit = (values: z.infer<typeof updateTaskStatusSchema>) => {
    if (!taskId) {
      return;
    }

    startTransition(async () => {
      const result = await updateTaskStatusAction({
        ...values,
        taskId,
        sprintId,
        status: targetStatus,
      });

      if (result.success) {
        const isBlocked = targetStatus === "BLOCKED";
        toast.success(isBlocked ? "Task blocked" : "Task updated");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update task");
      }
    });
  };

  const isBlocked = targetStatus === "BLOCKED";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBlocked ? "Block Task" : "Update Task"}</DialogTitle>
          <DialogDescription>
            {isBlocked
              ? "Explain why this task is blocked. This helps the team understand dependencies."
              : "Provide an optional note for this status change."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBlocked ? "Reason" : "Note"}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={
                        isBlocked
                          ? "e.g. Waiting for API endpoint from backend team"
                          : "Optional comment"
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                disabled={isPending}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? (isBlocked ? "Blocking..." : "Saving...") : (isBlocked ? "Block Task" : "Save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
