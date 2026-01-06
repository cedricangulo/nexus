"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { updateTaskStatusAction } from "@/actions/tasks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { updateTaskStatusSchema } from "@/lib/validation";

type MemberTaskBlockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
  sprintId: string;
  onSuccess?: () => void;
};

export function MemberTaskBlockDialog({
  open,
  onOpenChange,
  taskId,
  sprintId,
  onSuccess,
}: MemberTaskBlockDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();

  const form = useForm<z.infer<typeof updateTaskStatusSchema>>({
    resolver: zodResolver(updateTaskStatusSchema),
    defaultValues: {
      taskId: "",
      sprintId,
      status: "BLOCKED",
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
      status: "BLOCKED",
      comment: "",
    });
  }, [open, taskId, sprintId, form]);

  const onSubmit = (values: z.infer<typeof updateTaskStatusSchema>) => {
    if (!taskId) {
      return;
    }

    startTransition(async () => {
      const result = await updateTaskStatusAction({
        ...values,
        taskId,
        sprintId,
        status: "BLOCKED",
      });

      if (result.success) {
        toast.success("Task blocked");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to block task");
      }
    });
  };

  const formContent = (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="e.g. Waiting for API endpoint from backend team"
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
            <DrawerTitle>Block Task</DrawerTitle>
            <DrawerDescription>
              Explain why this task is blocked. This helps the team understand
              dependencies.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4">{formContent}</div>

          <DrawerFooter>
            <Button
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
              type="button"
            >
              {isPending ? "Blocking..." : "Block Task"}
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
          <DialogTitle>Block Task</DialogTitle>
          <DialogDescription>
            Explain why this task is blocked. This helps the team understand
            dependencies.
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
          >
            {isPending ? "Blocking..." : "Block Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
