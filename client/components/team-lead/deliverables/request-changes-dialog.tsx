"use client";

import { Send } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";

export type RequestChangesDialogProps = {
  comment: string;
  isPending: boolean;
  open: boolean;
  onCommentChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
};

export function RequestChangesDialog({
  comment,
  isPending,
  open,
  onCommentChange,
  onOpenChange,
  onSubmit,
}: RequestChangesDialogProps) {
  const isMobile = useIsMobile();

  const textareaContent = (
    <Textarea
      onChange={(e) => onCommentChange(e.target.value)}
      placeholder="Feedback comment"
      rows={3}
      value={comment}
    />
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Request Changes</DrawerTitle>
            <DrawerDescription>
              Add feedback so the team knows what to fix.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4">{textareaContent}</div>

          <DrawerFooter>
            <Button
              disabled={isPending || comment.trim() === ""}
              onClick={onSubmit}
            >
              <Send /> Submit
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
          <DialogTitle>Request Changes</DialogTitle>
          <DialogDescription>
            Add feedback so the team knows what to fix.
          </DialogDescription>
        </DialogHeader>

        {textareaContent}

        <DialogFooter>
          <Button
            disabled={isPending || comment.trim() === ""}
            onClick={onSubmit}
          >
            <Send /> Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
