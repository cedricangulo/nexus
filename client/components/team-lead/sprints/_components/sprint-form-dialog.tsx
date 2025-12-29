"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import type { DateValue, RangeValue } from "react-aria-components";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { updateSprintAction } from "@/actions/sprints";
import { createSprintAction } from "@/actions/sprints";
import DateRange from "@/components/shared/date-range";
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
import type { Sprint } from "@/lib/types";
import { createSprintSchema } from "@/lib/validation";

type SprintFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint?: Sprint; // If provided, we are in edit mode
};

export function SprintFormDialog({
  open,
  onOpenChange,
  sprint,
}: SprintFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isMobile = useIsMobile();
  const isEditing = !!sprint;

  const form = useForm<z.infer<typeof createSprintSchema>>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: {
      goal: "",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (open && sprint) {
      form.reset({
        goal: sprint.goal || "",
        startDate: sprint.startDate.split("T")[0],
        endDate: sprint.endDate.split("T")[0],
      });
    } else if (open && !sprint) {
      form.reset({
        goal: "",
        startDate: "",
        endDate: "",
      });
    }
  }, [open, sprint, form]);

  const onSubmit = (values: z.infer<typeof createSprintSchema>) => {
    startTransition(async () => {
      let result;
      
      if (isEditing && sprint) {
        result = await updateSprintAction({
          id: sprint.id,
          ...values,
        });
      } else {
        result = await createSprintAction(values);
      }

      if (result.success) {
        toast.success(isEditing ? "Sprint updated" : "Sprint created");
        onOpenChange(false);
        router.refresh();
        if (!isEditing) {
          form.reset();
        }
      } else {
        toast.error(result.error || `Failed to ${isEditing ? "update" : "create"} sprint`);
      }
    });
  };

  const formContent = (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="What should be achieved in this sprint"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="startDate"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Start and End Dates</FormLabel>
                <FormControl>
                  <DateRange
                    onChange={(range: RangeValue<DateValue> | null) => {
                      if (!range) {
                        form.setValue("startDate", "");
                        form.setValue("endDate", "");
                        return;
                      }

                      form.setValue("startDate", range.start.toString());
                      form.setValue("endDate", range.end.toString());
                    }}
                    value={
                      form.getValues("startDate") &&
                      form.getValues("endDate")
                        ? {
                            start: parseDate(form.getValues("startDate")),
                            end: parseDate(form.getValues("endDate")),
                          }
                        : null
                    }
                  />
                </FormControl>
                {fieldState.invalid ? (
                  <p className="mt-1 text-destructive text-sm">
                    {fieldState.error?.message}
                  </p>
                ) : null}
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isEditing ? `Edit Sprint ${sprint?.number}` : "Create Sprint"}</DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? "Update the sprint goal and timeline."
                : "Create a new sprint with a goal and date range."}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4">
            {formContent}
          </div>

          <DrawerFooter>
            <Button
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
              type="button"
            >
              {isPending ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Sprint")}
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
          <DialogTitle>{isEditing ? `Edit Sprint ${sprint?.number}` : "Create Sprint"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the sprint goal and timeline."
              : "Create a new sprint with a goal and date range."}
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
            {isPending ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Sprint")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
