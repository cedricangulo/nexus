"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createSprintTaskAction } from "@/actions/tasks";
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
import { Spinner } from "@/components/ui/spinner";
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
      assigneeIds: [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        sprintId,
        title: "",
        description: "",
        assigneeIds: [],
      });
    }
  }, [open, sprintId, form]);

  const selectedAssigneeIds = form.watch("assigneeIds") || [];

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
          name="assigneeIds"
          render={() => (
            <FormItem>
              <FormLabel>Assignees (Optional)</FormLabel>
              {selectedAssigneeIds.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {selectedAssigneeIds.map((id) => {
                    const user = users.find((u) => u.id === id);
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
                    {availableAssignees.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
          <PlusIcon />
          Add Task
        </Button>

        <Drawer onOpenChange={setOpen} open={open}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add Task</DrawerTitle>
              <DrawerDescription>
                Create a task and assign it to team members.
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4">{formContent}</div>

            <DrawerFooter>
              <Button
                disabled={isPending}
                onClick={form.handleSubmit(onSubmit)}
                type="button"
              >
                {isPending ? (
                  <>
                    <Spinner /> Adding
                  </>
                ) : (
                  <>
                    <PlusIcon /> Add Task
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
            Create a task and assign it to team members.
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
            {isPending ? (
              <>
                <Spinner /> Adding
              </>
            ) : (
              <>
                <PlusIcon /> Add Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
