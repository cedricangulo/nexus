"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { type LoginActionResponse, loginAction } from "@/actions/login";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "../ui/frame";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginValues = z.infer<typeof loginSchema>;

/**
 * Helper: Check if error is a navigation-related error
 */
function isNavigationError(error: unknown): boolean {
  const errorStr = String(error);
  return (
    errorStr.includes("NEXT_REDIRECT") ||
    errorStr.includes("redirect") ||
    errorStr.includes("navigation")
  );
}

/**
 * Helper: Set field-specific validation errors from response
 */
function applyFieldErrors(
  result: LoginActionResponse,
  form: ReturnType<typeof useForm<LoginValues>>
): void {
  if (!result.fieldErrors) return;

  for (const [field, errors] of Object.entries(result.fieldErrors)) {
    if (errors?.length) {
      form.setError(field as keyof LoginValues, {
        type: "manual",
        message: errors[0],
      });
    }
  }
}

/**
 * Helper: Handle login action result
 */
function handleLoginResult(
  result: LoginActionResponse | null | undefined,
  form: ReturnType<typeof useForm<LoginValues>>,
  setLastError: (error: LoginActionResponse) => void
): void {
  // Successful redirect happened
  if (!result) return;

  if (!result.success) {
    setLastError(result);
    applyFieldErrors(result, form);
  }
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPending, startTransition] = useTransition();
  const [lastError, setLastError] = useState<LoginActionResponse | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Show toast notifications for errors
  useEffect(() => {
    if (lastError?.authError) {
      toast.error(lastError.authError.message, {
        duration: 5000,
      });
    }
  }, [lastError]);

  function onSubmit(values: LoginValues) {
    setLastError(null);

    startTransition(async () => {
      try {
        const result = await loginAction(values);
        handleLoginResult(result, form, setLastError);
      } catch (error) {
        // Only show toast for actual errors, not navigation-related ones
        if (!isNavigationError(error)) {
          console.error("Unexpected login error:", error);
          toast.error("An unexpected error occurred", {
            description:
              "Please try again or contact support if the issue persists.",
          });
        }
      }
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Frame className="backdrop-blur-2xl">
        <FrameHeader className="space-y-0 p-4">
          <FrameTitle className="text-xl">Welcome!</FrameTitle>
          <FrameDescription>
            Sign in to your account to get started
          </FrameDescription>
        </FrameHeader>
        <FramePanel>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                      disabled={isPending}
                      id={field.name}
                      placeholder="m@example.com"
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
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                      disabled={isPending}
                      id={field.name}
                      type="password"
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </FramePanel>
        <FrameFooter>
          <Button
            className="w-full"
            disabled={isPending}
            form="login-form"
            type="submit"
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </FrameFooter>
      </Frame>
    </div>
  );
}
