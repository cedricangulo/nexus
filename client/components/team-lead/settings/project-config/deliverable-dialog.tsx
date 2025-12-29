"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { methodologyDeliverableSchema } from "@/lib/validation/project-config";
import type { DeliverableDialogValues } from "./methodology";

export default function DeliverableDialog({
  defaultValues,
  description,
  onOpenChange,
  onSubmit,
  open,
  title,
}: {
  defaultValues: DeliverableDialogValues;
  description: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DeliverableDialogValues) => void;
  open: boolean;
  title: string;
}) {
  const isMobile = useIsMobile();
  const form = useForm<DeliverableDialogValues>({
    resolver: zodResolver(methodologyDeliverableSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, open]);

  const isPending = form.formState.isSubmitting;

  const formContent = (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        onSubmit(values);
        onOpenChange(false);
      })}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id={field.name}
                placeholder="Enter deliverable title"
                required
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="dueDate"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Due Date</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id={field.name}
                type="date"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Textarea
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id={field.name}
                placeholder="Optional notes"
                rows={3}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            form.reset(defaultValues);
          }
          onOpenChange(nextOpen);
        }}
        open={open}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>

          <div className="px-4">
            {formContent}
          </div>

          <DrawerFooter>
            <Button
              disabled={!form.formState.isValid || isPending}
              onClick={form.handleSubmit((values) => {
                onSubmit(values);
                onOpenChange(false);
              })}
              type="button"
            >
              Save
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          form.reset(defaultValues);
        }
        onOpenChange(nextOpen);
      }}
      open={open}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {formContent}

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={!form.formState.isValid || isPending}
            onClick={form.handleSubmit((values) => {
              onSubmit(values);
              onOpenChange(false);
            })}
            type="button"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
