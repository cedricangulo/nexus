"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { updateDeliverableAction } from "@/actions/phases";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatTitleCase } from "@/lib/helpers";
import { type Deliverable, DeliverableStatus } from "@/lib/types";
import { deliverableSchema } from "@/lib/validation";

type DeliverableEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliverable: Deliverable;
};

type FormValues = z.infer<typeof deliverableSchema>;

export function DeliverableEditDialog({
  open,
  onOpenChange,
  deliverable,
}: DeliverableEditDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isMobile = useIsMobile();

  const form = useForm<FormValues>({
    resolver: zodResolver(deliverableSchema),
    defaultValues: {
      title: "",
      dueDate: "",
      description: "",
      status: DeliverableStatus.NOT_STARTED,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: deliverable.title,
        dueDate: deliverable.dueDate ? deliverable.dueDate.split("T")[0] : "",
        description: deliverable.description || "",
        status: deliverable.status,
      });
    }
  }, [open, deliverable, form]);

  const onSubmit = (values: FormValues) => {
    onOpenChange(false);

    startTransition(async () => {
      const isLoading = toast.loading("Updating deliverable...");
      
      const result = await updateDeliverableAction({
        id: deliverable.id,
        ...values,
      });

      toast.dismiss(isLoading);

      if (result.success) {
        toast.success("Deliverable updated successfully");
        router.refresh();
      } else {
        onOpenChange(true);
        toast.error(result.error || "Failed to update deliverable");
      }
    });
  };

  const formContent = (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                defaultValue={field.value}
                disabled={isPending}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(DeliverableStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatTitleCase(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
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
            <DrawerTitle>Edit Deliverable</DrawerTitle>
            <DrawerDescription>
              Update the details for this deliverable.
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
          <DialogTitle>Edit Deliverable</DialogTitle>
          <DialogDescription>
            Update the details for this deliverable.
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
