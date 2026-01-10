"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { updatePhaseTaskAction } from "@/actions/tasks";
import {
  Dialog,
  DialogClose,
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
import { FieldError } from "@/components/ui/field";
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
import { type Task, TaskStatus, type User } from "@/lib/types";
import { updatePhaseTaskSchema } from "@/lib/validation";
import { useAuthContext } from "@/providers/auth-context-provider";

type EditTaskDialogProps = {
  phaseId: string;
  task: Task;
  users: User[];
  userRole: "teamLead" | "member";
  dialogControl?: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };
};

function canUpdateTaskStatus(
  currentUserId: string,
  originalAssigneeIds: string[] | undefined,
  userRole: "teamLead" | "member"
) {
  if (userRole === "teamLead") {
    return true;
  }

  // Members can only update if they are assigned to the original task
  if (currentUserId && originalAssigneeIds?.includes(currentUserId)) {
    return true;
  }

  return false;
}

export function EditTaskDialog({
  phaseId,
  task,
  users,
  userRole,
  dialogControl,
}: EditTaskDialogProps) {
  const { user } = useAuthContext();
  const isControlled = !!dialogControl;

  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isMobile = useIsMobile();
  const isMember = userRole === "member";

  const assigneeOptions: Option[] = useMemo(
    () =>
      users
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((u) => ({ value: u.id, label: u.name })),
    [users]
  );

  type FormValues = z.infer<typeof updatePhaseTaskSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(updatePhaseTaskSchema),
    defaultValues: {
      taskId: task.id,
      phaseId: phaseId || "",
      title: task.title,
      description: task.description || "",
      status: task.status,
      assigneeIds: task.assignees?.map((a) => a.id) || [],
    },
  });

  const originalAssigneeIds = task.assignees?.map((a) => a.id) || [];
  const canUpdate = canUpdateTaskStatus(user.id, originalAssigneeIds, userRole);

  const [selectedAssignees, setSelectedAssignees] = useState<Option[]>([]);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? dialogControl.open : internalOpen;
  const setOpen = isControlled ? dialogControl.onOpenChange : setInternalOpen;

  useEffect(() => {
    if (open) {
      const assignees = task.assignees || [];
      const assigneeOpts = assignees
        .map((a) => assigneeOptions.find((opt) => opt.value === a.id))
        .filter((opt): opt is Option => opt !== undefined);

      form.reset({
        taskId: task.id,
        phaseId: task.phaseId || "",
        title: task.title,
        description: task.description || "",
        status: task.status,
        assigneeIds: assignees.map((a) => a.id),
      });
      setSelectedAssignees(assigneeOpts);
    }
  }, [open, task, assigneeOptions, form]);

  const handleAssigneeChange = (options: Option[]) => {
    setSelectedAssignees(options);
    form.setValue(
      "assigneeIds",
      options.map((o) => o.value)
    );
  };

  const onSubmit = (values: FormValues) => {
    if (!canUpdate) {
      toast.error("You don't have permission to update this task");
      return;
    }

    startTransition(async () => {
      const result = await updatePhaseTaskAction(values, task.phaseId || "");

      if (result.success) {
        toast.success("Task updated");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update task");
      }
    });
  };

  const formContent = (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Show title and description fields only if the user is not a member or cannot update */}
        {isMember ? null : (
          <>
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
                  <FormLabel>Description (optional)</FormLabel>
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
          </>
        )}

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                disabled={isPending || !canUpdate}
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
              {canUpdate ? null : (
                <FieldError
                  errors={[
                    { message: "Only assigned members can change task status" },
                  ]}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {isMember ? null : (
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
        )}
      </form>
    </Form>
  );

  const dialogTitle = "Edit Task";
  const dialogDescription = isMember
    ? "Update the status for this phase task."
    : "Update the details for this phase task.";

  if (isMobile) {
    return (
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{dialogTitle}</DrawerTitle>
            <DrawerDescription>{dialogDescription}</DrawerDescription>
          </DrawerHeader>

          <div className="px-4">{formContent}</div>

          <DrawerFooter>
            <Button
              disabled={isPending || !canUpdate}
              onClick={form.handleSubmit(onSubmit)}
              type="button"
            >
              {isPending ? (
                <>
                  <Spinner /> Saving
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
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {formContent}

        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isPending} type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={isPending || !canUpdate}
            onClick={form.handleSubmit(onSubmit)}
            type="button"
          >
            {isPending ? (
              <>
                <Spinner /> Saving
              </>
            ) : (
              <>
                <Save /> Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
