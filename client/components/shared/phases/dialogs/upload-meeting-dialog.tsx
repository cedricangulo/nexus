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
import { getCurrentDate } from "@/lib/helpers/date";
import { uploadSchema } from "@/lib/validation";

type UploadInput = z.infer<typeof uploadSchema>;

type UploadMeetingDialogProps = {
  phaseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UploadMeetingDialog({
  phaseId,
  open,
  onOpenChange,
}: UploadMeetingDialogProps) {
  const [_isPending, startTransition] = useTransition();
  const maxSize = 10 * 1024 * 1024; // 10MB

  const form = useForm<UploadInput>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      date: getCurrentDate(),
      scope: "phase",
      entityId: phaseId,
      file: undefined,
    },
  });

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        form.reset({
          title: "",
          date: getCurrentDate(),
          scope: "phase",
          entityId: phaseId,
          file: undefined,
        });
      }
      onOpenChange(newOpen);
    },
    [form, phaseId, onOpenChange]
  );

  const handleUpload = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) {
        return;
      }

      // Validate metadata before uploading
      const isValid = await form.trigger(["title", "date"]);
      if (!isValid) {
        toast.error("Please fill in all required fields");
        throw new Error("Please fill in all required fields");
      }

      const formValues = form.getValues();
      const formData = new FormData();
      formData.append("scope", "phase");
      formData.append("entityId", phaseId);
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
          form.reset({
            title: "",
            date: getCurrentDate(),
            scope: "phase",
            entityId: phaseId,
            file: undefined,
          });
        } else {
          toast.error(result.error || "Failed to upload meeting minutes");
          throw new Error(result.error);
        }
      });
    },
    [form, phaseId]
  );

  return (
    <AutoUploadDialog
      config={{
        accept: ".pdf",
        maxSize,
        maxFiles: 1,
        requiresConfirmation: true,
      }}
      content={{
        title: "Upload Phase Meeting Minutes",
        description:
          "Fill in the meeting details below, then select a PDF file. Click Upload to confirm.",
      }}
      control={{ open, onOpenChange: handleOpenChange }}
      features={{
        renderMetadataForm: ({ file, isUploading }) => (
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
                    placeholder="e.g., Phase Kickoff Meeting"
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
          </FieldGroup>
        ),
      }}
      handlers={{
        onUpload: handleUpload,
      }}
    />
  );
}
