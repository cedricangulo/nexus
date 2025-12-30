"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { updatePhaseAction } from "@/actions/phases";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PhaseDetail } from "@/lib/types";
import { phaseSchema } from "@/lib/validation";

type PhaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: PhaseDetail | null;
};

export function PhaseDialog({ open, onOpenChange, phase }: PhaseDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isMobile = useIsMobile();

  const form = useForm({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  // Populate form when dialog opens with phase data
  useEffect(() => {
    if (open && phase) {
      form.reset({
        name: phase.name,
        startDate: phase.startDate ? phase.startDate.split("T")[0] : "",
        endDate: phase.endDate ? phase.endDate.split("T")[0] : "",
        description: phase.description || "",
      });
    } else if (open && !phase) {
      form.reset({
        name: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    }
  }, [open, phase, form]);

  const onSubmit = (values: z.infer<typeof phaseSchema>) => {
    if (!phase) {
      return;
    }

    // Close dialog immediately before async action
    onOpenChange(false);

    startTransition(async () => {
      const result = await updatePhaseAction({
        id: phase.id,
        ...values,
      });

      if (result.success) {
        toast.success("Phase updated successfully");
        // Refresh the page to fetch updated data from server
        router.refresh();
      } else {
        onOpenChange(true);
        toast.error(result.error || "Failed to update phase");
      }
    });
  };

  const formContent = (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phase Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Phase</DrawerTitle>
            <DrawerDescription>
              Update the details for this project phase.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4">{formContent}</div>

          <DrawerFooter>
            <Button
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
              type="button"
            >
              {isPending ? "Saving..." : "Save Changes"}
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
          <DialogTitle>Edit Phase</DialogTitle>
          <DialogDescription>
            Update the details for this project phase.
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
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
            type="button"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
