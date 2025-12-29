"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { uploadMeetingLogAction } from "@/actions/meetings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();

  const form = useForm<UploadInput>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      date: new Date().toISOString().split("T")[0],
      scope: "sprint",
      entityId: "",
      file: undefined,
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const scope = form.watch("scope");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB");
        return;
      }
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      setFileName(file.name);
      form.setValue("file", file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fix the errors before uploading");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.getValues("title"));
    formData.append("date", form.getValues("date"));
    formData.append("scope", form.getValues("scope"));
    formData.append("entityId", form.getValues("entityId"));
    formData.append("file", form.getValues("file"));

    startTransition(async () => {
      const result = await uploadMeetingLogAction(
        {} as Parameters<typeof uploadMeetingLogAction>[0],
        formData
      );

      if (result.success) {
        toast.success("Meeting minutes uploaded successfully");
        setTimeout(() => {
          handleOpenChange(false);
        }, 500);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      onOpenChange(true);
    } else {
      form.reset();
      setFileName("");
      onOpenChange(false);
    }
  };

  const selectedEntities = scope === "sprint" ? sprints : phases;

  const formContent = (
    <form className="space-y-6" onSubmit={handleSubmit}>
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
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
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
          name="scope"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="scope">Scope</FieldLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger aria-invalid={fieldState.invalid} id="entityId">
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

        <Field>
          <FieldLabel htmlFor="file">Meeting Minutes (PDF)</FieldLabel>
          <div className="rounded-lg border-2 border-muted-foreground/30 border-dashed p-6">
            <input
              accept=".pdf"
              className="hidden"
              id="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
            <button
              className="flex w-full flex-col items-center gap-2 text-center"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <Upload className="text-muted-foreground" size={24} />
              <div>
                <p className="font-medium text-sm">
                  {fileName || "Click to upload PDF"}
                </p>
                <p className="text-muted-foreground text-xs">
                  Max 10MB, PDF only
                </p>
              </div>
            </button>
          </div>
          {form.formState.errors.file ? (
            <FieldError errors={[form.formState.errors.file]} />
          ) : null}
        </Field>
      </FieldGroup>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={handleOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Upload Meeting Minutes</DrawerTitle>
            <DrawerDescription>
              Upload meeting minutes and link them to a sprint or phase.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{formContent}</div>
          <DrawerFooter>
            <Button
              disabled={isPending}
              onClick={form.handleSubmit((data) => {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                  formData.append(key, value);
                });
                startTransition(async () => {
                  const result = await uploadMeetingLogAction(
                    {} as any,
                    formData
                  );
                  if (result.success) {
                    toast.success("Meeting minutes uploaded successfully");
                    setTimeout(() => handleOpenChange(false), 500);
                  } else if (result.error) {
                    toast.error(result.error);
                  }
                });
              })}
              type="button"
            >
              {isPending ? "Uploading..." : "Upload Minutes"}
            </Button>
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Meeting Minutes</DialogTitle>
          <DialogDescription>
            Upload meeting minutes and link them to a sprint or phase.
          </DialogDescription>
        </DialogHeader>
        {formContent}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={isPending} form="upload-form" type="submit">
            {isPending ? "Uploading..." : "Upload Minutes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
