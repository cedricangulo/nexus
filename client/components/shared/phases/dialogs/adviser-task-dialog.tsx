"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Task } from "@/lib/types";
import { getInitials } from "@/lib/utils";

type AdviserTaskDialogProps = {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdviserTaskDialog({
  task,
  open,
  onOpenChange,
}: AdviserTaskDialogProps) {
  const isMobile = useIsMobile();
  const assignees = task.assignees || [];

  const formContent = (
    <div className="space-y-4">
      {/* Status */}
      <StatusBadge status={task.status} />

      {/* Assignees */}
      <div className="space-y-2">
        <Label className="font-medium text-sm">Assignees</Label>
        {assignees.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {assignees.map((assignee) => (
              <div className="flex items-center gap-2" key={assignee.id}>
                <Avatar className="size-6 border border-background">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{assignee.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm italic">Unassigned</p>
        )}
      </div>

      {/* Block Reason (only shown when status is BLOCKED) */}
      {task.status === "BLOCKED" && task.lastComment?.content && (
        <div className="space-y-2">
          <Label className="font-medium text-sm">Block Reason</Label>
          <p className="whitespace-pre-wrap text-muted-foreground text-sm">
            {task.lastComment.content}
          </p>
        </div>
      )}

      <Separator />

      {/* Timestamps */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="space-y-1">
          <Label className="font-medium text-muted-foreground text-xs">
            Created
          </Label>
          <p className="text-sm">
            {format(new Date(task.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <div className="space-y-1">
          <Label className="font-medium text-muted-foreground text-xs">
            Updated
          </Label>
          <p className="text-sm">
            {format(new Date(task.updatedAt), "MMM d, yyyy")}
          </p>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{task.title}</DrawerTitle>
            <DrawerDescription>{task.description}</DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-8">{formContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
