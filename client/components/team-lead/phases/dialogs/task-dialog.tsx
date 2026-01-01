"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { createPhaseTaskAction, updatePhaseTaskAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { type Task, TaskStatus, type User } from "@/lib/types";
import { createPhaseTaskSchema, updatePhaseTaskSchema } from "@/lib/validation";

type TaskDialogProps = {
  phaseId: string;
  users: User[];
  initialData?: Task | null;
  dialogControl?: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };
  trigger?: React.ReactNode;
};

// Helper to get button label based on state
function getButtonLabel(isPending: boolean, isEditMode: boolean): string {
  if (isPending) {
    return "Saving...";
  }
  return isEditMode ? "Save Changes" : "Create Task";
}

export function TaskDialog({
  phaseId,
  users,
  initialData = null,
  dialogControl,
  trigger,
}: TaskDialogProps) {
  const isControlled = !!dialogControl;
  const isEditMode = !!initialData;

  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isMobile = useIsMobile();

  const open = isControlled ? dialogControl.open : internalOpen;
  const setOpen = isControlled ? dialogControl.onOpenChange : setInternalOpen;

  const assigneeOptions: Option[] = useMemo(
    () =>
      users
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((u) => ({ value: u.id, label: u.name })),
    [users]
  );

  // Use the appropriate schema based on mode to ensure proper typing
  const schema = isEditMode ? updatePhaseTaskSchema : createPhaseTaskSchema;
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      phaseId,
      title: "",
      description: "",
      status: "TODO" as const,
      assigneeIds: [],
    } as FormValues,
  });

  const [selectedAssignees, setSelectedAssignees] = useState<Option[]>([]);

  useEffect(() => {
    if (open && initialData) {
      const assignees = initialData.assignees || [];
      const assigneeOpts = assignees
        .map((a) => assigneeOptions.find((opt) => opt.value === a.id))
        .filter((opt): opt is Option => opt !== undefined);

      form.reset({
        ...(isEditMode && { taskId: initialData.id }),
        phaseId: initialData.phaseId || phaseId,
        title: initialData.title,
        description: initialData.description || "",
        status: initialData.status,
        assigneeIds: assignees.map((a) => a.id),
      });
      setSelectedAssignees(assigneeOpts);
    } else if (open && !initialData) {
      form.reset({
        phaseId,
        title: "",
        description: "",
        status: "TODO" as const,
        assigneeIds: [],
      });
      setSelectedAssignees([]);
    }
  }, [open, initialData, phaseId, assigneeOptions, form, isEditMode]);

  const handleAssigneeChange = (options: Option[]) => {
    setSelectedAssignees(options);
    form.setValue(
      "assigneeIds",
      options.map((o) => o.value)
    );
  };

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = isEditMode
        ? await updatePhaseTaskAction(
            values as z.infer<typeof updatePhaseTaskSchema>,
            phaseId
          )
        : await createPhaseTaskAction(
            values as z.infer<typeof createPhaseTaskSchema>
          );

      if (result.success) {
        toast.success(isEditMode ? "Task updated" : "Task created");
        setOpen(false);
        router.refresh();
        if (!isEditMode) {
          form.reset();
          setSelectedAssignees([]);
        }
      } else {
        toast.error(
          result.error || `Failed to ${isEditMode ? "update" : "create"} task`
        );
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
              <FormLabel>
                Description {isEditMode ? "(optional)" : ""}
              </FormLabel>
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
                  <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={TaskStatus.BLOCKED}>Blocked</SelectItem>
                  <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
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
              <FormLabel>Assignees (Optional)</FormLabel>
              <FormControl>
                <MultipleSelector
                  commandProps={{
                    label: "Select assignees",
                  }}
                  defaultOptions={assigneeOptions}
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

  const dialogTitle = isEditMode ? "Edit Task" : "Create Task";
  const dialogDescription = isEditMode
    ? "Update the details for this phase task."
    : "Add a new task to this phase.";

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        {trigger && !isControlled && (
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        )}
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{dialogTitle}</DrawerTitle>
            <DrawerDescription>{dialogDescription}</DrawerDescription>
          </DrawerHeader>

          <div className="px-4">{formContent}</div>

          <DrawerFooter>
            <Button
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
              type="button"
            >
              {getButtonLabel(isPending, isEditMode)}
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
      {trigger && !isControlled && (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {formContent}

        <DialogFooter className="sm:grid sm:grid-cols-2">
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
            {getButtonLabel(isPending, isEditMode)}
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
    <TaskDialog
      phaseId={phaseId}
      trigger={
        <Button size="sm" variant="outline">
          <PlusIcon className="size-4" />
          Add
        </Button>
      }
      users={users}
    />
  );
}
