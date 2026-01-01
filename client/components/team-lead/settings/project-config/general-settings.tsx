"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { parseDate } from "@internationalized/date";
import { Save } from "lucide-react";
import { useState } from "react";
import type { DateValue, RangeValue } from "react-aria-components";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateProjectAction } from "@/actions/project-config";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toISODateTime } from "@/lib/helpers/date";
import { formatRelativeTime } from "@/lib/helpers/format-date";
import type { Project } from "@/lib/types";
import DateRange from "../../../shared/date-range";

const generalSettingsSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional().or(z.literal("")),
  dateRange: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
});

type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;

type GeneralSettingsProps = {
  project: Project | null;
};

export default function GeneralSettings({ project }: GeneralSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastEdited, setLastEdited] = useState<string>(
    project ? formatRelativeTime(project.updatedAt) : "Never"
  );

  const form = useForm<GeneralSettingsInput>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      dateRange: {
        start: project?.startDate
          ? new Date(project.startDate).toISOString().split("T")[0]
          : "",
        end: project?.endDate
          ? new Date(project.endDate).toISOString().split("T")[0]
          : "",
      },
    },
  });

  const onSubmit = async (data: GeneralSettingsInput) => {
    setIsSaving(true);
    const toastId = toast.loading("Saving project settings...");
    try {
      const updated = await updateProjectAction({
        name: data.name,
        description: data.description || undefined,
        startDate: toISODateTime(data.dateRange?.start),
        endDate: toISODateTime(data.dateRange?.end),
      });

      if (updated) {
        setLastEdited(formatRelativeTime(updated.updatedAt));
        toast.dismiss(toastId);
        toast.success("Project settings saved successfully");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save project settings";
      console.error("Failed to update project:", error);
      toast.dismiss(toastId);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!project) {
    return (
      <Frame id="general-settings">
        <FrameHeader>
          <FrameTitle>General Settings</FrameTitle>
          <FrameDescription>
            Basic identification details for your capstone project.
          </FrameDescription>
        </FrameHeader>
        <FramePanel className="space-y-8">
          <p className="text-center text-muted-foreground">
            No project found. Please contact your administrator.
          </p>
        </FramePanel>
      </Frame>
    );
  }

  return (
    <Frame id="general-settings">
      <FrameHeader className="p-4">
        <FrameTitle>General Settings</FrameTitle>
        <FrameDescription>
          Basic identification details for your capstone project.
        </FrameDescription>
      </FrameHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FramePanel className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel className="font-medium" htmlFor="project-name">
                Project Name
              </FieldLabel>
              <Input
                id="project-name"
                placeholder="Enter project name"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <p className="mt-1 text-destructive text-sm">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </Field>
            <Controller
              control={form.control}
              name="dateRange"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="font-medium" htmlFor="date-range">
                    Start and End Dates
                  </FieldLabel>
                  <DateRange
                    id="date-range"
                    onChange={(range: RangeValue<DateValue> | null) => {
                      if (!range) {
                        field.onChange({ start: "", end: "" });
                        return;
                      }

                      field.onChange({
                        start: range.start.toString(),
                        end: range.end.toString(),
                      });
                    }}
                    value={
                      field.value?.start && field.value?.end
                        ? {
                            start: parseDate(field.value.start),
                            end: parseDate(field.value.end),
                          }
                        : null
                    }
                  />
                  {fieldState.invalid ? (
                    <p className="mt-1 text-destructive text-sm">
                      {fieldState.error?.message}
                    </p>
                  ) : null}
                </Field>
              )}
            />
          </div>
          <Field>
            <FieldLabel className="font-medium" htmlFor="project-description">
              Project Description
            </FieldLabel>
            <Textarea
              id="project-description"
              placeholder="Enter project description"
              rows={3}
              {...form.register("description")}
            />
          </Field>
        </FramePanel>
        <FrameFooter className="flex-row justify-between">
          <p className="text-muted-foreground text-sm">
            Last Edited {lastEdited}
          </p>
          <Button disabled={isSaving} type="submit" variant="secondary">
            {isSaving ? (
              <>
                <Spinner /> Saving
              </>
            ) : (
              <>
                <Save /> Save Changes
              </>
            )}
          </Button>
        </FrameFooter>
      </form>
    </Frame>
  );
}
