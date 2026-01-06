"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { updatePhaseAction } from "@/actions/phases";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PhaseDetail } from "@/lib/types";
import { phaseSchema } from "@/lib/validation";

type PhaseEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: PhaseDetail;
};

type FormValues = z.infer<typeof phaseSchema>;

export function PhaseEditDialog({
  open,
  onOpenChange,
  phase,
}: PhaseEditDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isMobile = useIsMobile();

  const form = useForm<FormValues>({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: phase.name,
        startDate: phase.startDate ? phase.startDate.split("T")[0] : "",
        endDate: phase.endDate ? phase.endDate.split("T")[0] : "",
        description: phase.description || "",
      });
    }
  }, [open, phase, form]);

  const onSubmit = (values: FormValues) => {
    onOpenChange(false);

    startTransition(async () => {
      const result = await updatePhaseAction({
        id: phase.id,
        ...values,
      });

      if (result.success) {
        toast.success("Phase updated successfully");
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
                <Input {...field} disabled={isPending} />
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
                  <Input type="date" {...field} disabled={isPending} />
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
                  <Input type="date" {...field} disabled={isPending} />
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
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={isPending}
                  value={field.value || ""}
                />
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
              {isPending ? (
                <>
                  <Spinner /> Saving
                </>
              ) : (
                <>
                  <Save /> Save Changes
                </>
              )}
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
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
            type="button"
          >
            {isPending ? (
              <>
                <Spinner /> Saving
              </>
            ) : (
              <>
                <Save /> Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
