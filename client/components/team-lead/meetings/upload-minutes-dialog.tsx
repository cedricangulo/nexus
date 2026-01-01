"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { uploadMeetingLogAction } from "@/actions/meetings";
import { AutoUploadDialog } from "@/components/shared/dialogs/auto-upload-dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NaturalDateInput } from "@/components/ui/natural-date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrentDate } from "@/lib/helpers/date";
import type { Phase, Sprint } from "@/lib/types";
import { uploadSchema } from "@/lib/validation";

type UploadInput = z.infer<typeof uploadSchema>;

type UploadMinutesDialogProps = {
  sprints: Sprint[];
  phases: Phase[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UploadMinutesDialog({
  sprints,
  phases,
  open,
  onOpenChange,
}: UploadMinutesDialogProps) {
  const [_isPending, startTransition] = useTransition();
  const maxSize = 10 * 1024 * 1024; // 10MB

  const form = useForm<UploadInput>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      date: getCurrentDate(),
      scope: "sprint",
      entityId: "",
      file: undefined,
    },
  });

  const scope = form.watch("scope");
  const selectedEntities = scope === "sprint" ? sprints : phases;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        form.reset();
      }
      onOpenChange(newOpen);
    },
    [form, onOpenChange]
  );

  const handleUpload = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) {
        return;
      }

      // Validate metadata before uploading
      const isValid = await form.trigger([
        "title",
        "date",
        "scope",
        "entityId",
      ]);
      if (!isValid) {
        toast.error("Please fill in all required fields");
        throw new Error("Please fill in all required fields");
      }

      const formValues = form.getValues();
      const formData = new FormData();
      formData.append("scope", formValues.scope);
      formData.append("entityId", formValues.entityId);
      formData.append("title", formValues.title);
      formData.append("date", formValues.date);
      formData.append("file", file);

      const loadingToast = toast.loading("Uploading meeting minutes...");

      startTransition(async () => {
        const result = await uploadMeetingLogAction(
          { success: false },
          formData
        );

        toast.dismiss(loadingToast);

        if (result.success) {
          toast.success("Meeting minutes uploaded successfully");
          form.reset();
        } else {
          toast.error(result.error || "Failed to upload meeting minutes");
          throw new Error(result.error);
        }
      });
    },
    [form]
  );

  return (
    <AutoUploadDialog
      accept=".pdf"
      description="Fill in the meeting details below, then select a PDF file. Click Upload to confirm."
      maxFiles={1}
      maxSize={maxSize}
      onOpenChange={handleOpenChange}
      onUpload={handleUpload}
      open={open}
      renderMetadataForm={({ file, isUploading }) => (
        <FieldGroup>
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Meeting Title</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  disabled={isUploading}
                  id={field.name}
                  placeholder="e.g., Sprint Planning Meeting"
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="date"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Meeting Date</FieldLabel>
                <NaturalDateInput
                  disabled={isUploading}
                  id={field.name}
                  onChange={field.onChange}
                  placeholder="Today, yesterday, or YYYY-MM-DD"
                  value={field.value}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="scope"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="scope">Scope</FieldLabel>
                <Select
                  disabled={isUploading}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger aria-invalid={fieldState.invalid} id="scope">
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sprint">Sprint</SelectItem>
                    <SelectItem value="phase">Phase</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="entityId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="entityId">
                  {scope === "sprint" ? "Sprint" : "Phase"}
                </FieldLabel>
                <Select
                  disabled={isUploading}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger
                    aria-invalid={fieldState.invalid}
                    id="entityId"
                  >
                    <SelectValue
                      placeholder={`Select ${scope === "sprint" ? "sprint" : "phase"}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEntities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {scope === "sprint"
                          ? `Sprint ${(entity as Sprint).number}`
                          : (entity as Phase).name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
        </FieldGroup>
      )}
      requiresConfirmation={true}
      title="Upload Meeting Minutes"
    />
  );
}
