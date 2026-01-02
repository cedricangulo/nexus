import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full font-medium text-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost:
          "bg-accent/80 text-muted-foreground",
        success:
          "bg-success text-success-foreground",
        error:
          "bg-error text-error-foreground",
        warning:
          "bg-warning text-warning-foreground",
        info: "bg-info text-info-foreground",
        waterfall: "bg-waterfall text-waterfall-foreground",
        scrum: "bg-scrum text-scrum-foreground",
        fall: "bg-fall text-fall-foreground",
        "in-progress":
          "bg-info text-info-foreground",
      },
      size: {
        default: "px-1 has-[>svg]:pl-0.5 has-[>svg]:pr-1 has-[>svg]:gap-1",
        sm: "px-1.5 py-0.25 text-[0.65rem]",
        lg: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      className={cn(badgeVariants({ variant, size }), className)}
      data-slot="badge"
      {...props}
    />
  );
}

export { Badge, badgeVariants };
