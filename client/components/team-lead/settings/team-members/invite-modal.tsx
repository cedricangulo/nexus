"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { inviteMember } from "@/actions/invite-action";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ServerActionResponse } from "@/lib/types/auth";
import type { User } from "@/lib/types/models";
import type { InviteMemberInput } from "@/lib/validation/team-members";
import { inviteMemberSchema } from "@/lib/validation/team-members";

type InviteMemberModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (user: User) => void;
};

const roleOptions = [
  { value: "MEMBER", label: "Member" },
  { value: "TEAM_LEAD", label: "Team Lead" },
  { value: "ADVISER", label: "Adviser" },
] as const;

export function InviteMemberModal({
  open,
  onOpenChange,
  onSuccess,
}: InviteMemberModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "MEMBER",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setFormError(null);
    }
    onOpenChange(newOpen);
  };

  async function onSubmit(values: InviteMemberInput) {
    setFormError(null);

    const result: ServerActionResponse<User> = await inviteMember(values);

    if (result.success && result.data) {
      toast.success(`${result.data.name} has been invited successfully`, {
        description: `An email invitation has been sent to ${result.data.email}`,
      });
      form.reset();
      handleOpenChange(false);
      onSuccess?.(result.data);
    } else {
      toast.error(result.error ?? "Failed to invite member", {
        description: "Please check your input and try again",
      });
      setFormError(result.error ?? "Failed to invite member");
    }
  }

  const isPending = form.formState.isSubmitting;

  const formContent = (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="email"
                disabled={isPending}
                id={field.name}
                placeholder="member@example.com"
                type="email"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                id={field.name}
                placeholder="John Doe"
                type="text"
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="role"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Role</FieldLabel>
              <Select
                disabled={isPending}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger
                  aria-invalid={fieldState.invalid}
                  id={field.name}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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

        {formError ? <FieldError>{formError}</FieldError> : null}
      </FieldGroup>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={handleOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Invite Team Member</DrawerTitle>
            <DrawerDescription>
              Send an invitation to a new team member. They'll receive an email
              with login credentials.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4">
            {formContent}
          </div>

          <DrawerFooter>
            <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)} type="button">
              {isPending ? "Inviting..." : "Send Invitation"}
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
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to a new team member. They'll receive an email
            with login credentials.
          </DialogDescription>
        </DialogHeader>

        {formContent}

        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => handleOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)} type="button">
            {isPending ? "Inviting..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
