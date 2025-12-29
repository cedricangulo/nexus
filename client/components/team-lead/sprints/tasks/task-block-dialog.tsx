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
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

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

  const formContent = (
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
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isBlocked ? "Block Task" : "Update Task"}</DrawerTitle>
            <DrawerDescription>
              {isBlocked
                ? "Explain why this task is blocked. This helps the team understand dependencies."
                : "Provide an optional note for this status change."}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4">
            {formContent}
          </div>

          <DrawerFooter>
            <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)} type="button">
              {isPending ? (isBlocked ? "Blocking..." : "Saving...") : (isBlocked ? "Block Task" : "Save")}
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBlocked ? "Block Task" : "Update Task"}</DialogTitle>
          <DialogDescription>
            {isBlocked
              ? "Explain why this task is blocked. This helps the team understand dependencies."
              : "Provide an optional note for this status change."}
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
          <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)} type="button">
            {isPending ? (isBlocked ? "Blocking..." : "Saving...") : (isBlocked ? "Block Task" : "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
