"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createSprintTaskAction } from "@/actions/tasks";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/lib/types";
import { createSprintTaskSchema } from "@/lib/validation";

type CreateTaskDialogProps = {
  sprintId: string;
  users: User[];
};

export function CreateTaskDialog({ sprintId, users }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isMobile = useIsMobile();

  const assigneeOptions = useMemo(
    () =>
      users
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((u) => ({ value: u.id, label: u.name })),
    [users]
  );

  const form = useForm<z.infer<typeof createSprintTaskSchema>>({
    resolver: zodResolver(createSprintTaskSchema),
    defaultValues: {
      sprintId,
      title: "",
      description: "",
      assigneeId: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        sprintId,
        title: "",
        description: "",
        assigneeId: "",
      });
    }
  }, [open, sprintId, form]);

  const onSubmit = (values: z.infer<typeof createSprintTaskSchema>) => {
    startTransition(async () => {
      const result = await createSprintTaskAction(values);

      if (result.success) {
        toast.success("Task created");
        setOpen(false);
        router.refresh();
        form.reset();
      } else {
        toast.error(result.error || "Failed to create task");
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
          name="assigneeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {assigneeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Optional details" />
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
      <>
        <Button onClick={() => setOpen(true)}>
          <PlusIcon size={16} />
          Add Task
        </Button>

        <Drawer onOpenChange={setOpen} open={open}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add Task</DrawerTitle>
              <DrawerDescription>
                Create a task and assign it to a team member.
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4">{formContent}</div>

            <DrawerFooter>
              <Button
                disabled={isPending}
                onClick={form.handleSubmit(onSubmit)}
                type="button"
              >
                {isPending ? "Creating..." : "Add Task"}
              </Button>
              <DrawerClose asChild>
                <Button disabled={isPending} variant="outline">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon size={16} />
        Add Task
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            Create a task and assign it to a team member.
          </DialogDescription>
        </DialogHeader>

        {formContent}

        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => setOpen(false)}
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
            {isPending ? "Creating..." : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
