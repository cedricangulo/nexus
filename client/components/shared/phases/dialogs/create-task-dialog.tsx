"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createPhaseTaskAction } from "@/actions/tasks";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  DrawerTrigger,
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
import MultipleSelector, { type Option } from "@/components/ui/multiselect";
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
import { TaskStatus, type User } from "@/lib/types";
import { createPhaseTaskSchema } from "@/lib/validation";

type CreateTaskDialogProps = {
  phaseId: string;
  users: User[];
  trigger?: React.ReactNode;
};

export function CreateTaskDialog({
  phaseId,
  users,
  trigger,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isMobile = useIsMobile();

  const assigneeOptions: Option[] = useMemo(
    () =>
      users
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((u) => ({ value: u.id, label: u.name })),
    [users]
  );

  console.debug("CreateTaskDialog users prop:", users.map(u => ({ id: u.id, role: u.role, name: u.name })));
  console.debug("CreateTaskDialog assigneeOptions:", assigneeOptions);

  type FormValues = z.infer<typeof createPhaseTaskSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(createPhaseTaskSchema),
    defaultValues: {
      phaseId,
      title: "",
      description: "",
      status: "TODO" as const,
      assigneeIds: [],
    },
  });

  const [selectedAssignees, setSelectedAssignees] = useState<Option[]>([]);

  const handleAssigneeChange = (options: Option[]) => {
    setSelectedAssignees(options);
    form.setValue(
      "assigneeIds",
      options.map((o) => o.value)
    );
  };

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await createPhaseTaskAction(values);

      if (result.success) {
        toast.success("Task created");
        setOpen(false);
        form.reset();
        setSelectedAssignees([]);
        router.refresh();
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
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Task title"
                />
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
                  disabled={isPending}
                  placeholder="Task description"
                  rows={4}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                disabled={isPending}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={TaskStatus.TODO}>
                    <StatusBadge status={TaskStatus.TODO} />
                  </SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    <StatusBadge status={TaskStatus.IN_PROGRESS} />
                  </SelectItem>
                  <SelectItem value={TaskStatus.BLOCKED}>
                    <StatusBadge status={TaskStatus.BLOCKED} />
                  </SelectItem>
                  <SelectItem value={TaskStatus.DONE}>
                    <StatusBadge status={TaskStatus.DONE} />
                  </SelectItem>
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
              <FormControl>
                <MultipleSelector
                  commandProps={{
                    label: "Select assignees",
                  }}
                  options={assigneeOptions}
                  disabled={isPending}
                  emptyIndicator={
                    <p className="text-center text-sm">No members found</p>
                  }
                  hideClearAllButton
                  hidePlaceholderWhenSelected
                  onChange={handleAssigneeChange}
                  placeholder="Select team members..."
                  value={selectedAssignees}
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
      <Drawer onOpenChange={setOpen} open={open}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create Task</DrawerTitle>
            <DrawerDescription>Add a new task to this phase.</DrawerDescription>
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
                  <Spinner /> Creating
                </>
              ) : (
                <>
                  <Plus /> Create Task
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
    <Dialog onOpenChange={setOpen} open={open}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Add a new task to this phase.</DialogDescription>
        </DialogHeader>

        {formContent}

        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isPending} type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
            type="button"
          >
            {isPending ? (
              <>
                <Spinner /> Creating
              </>
            ) : (
              <>
                <Plus /> Create Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Convenience wrapper for create mode with trigger button
export function CreateTaskButton({
  phaseId,
  users,
}: {
  phaseId: string;
  users: User[];
}) {
  return (
    <CreateTaskDialog
      phaseId={phaseId}
      trigger={
        <Button size="sm" variant="secondary">
          <PlusIcon />
          Add
        </Button>
      }
      users={users}
    />
  );
}
