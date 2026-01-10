"use client";

import { ExternalLink, FileIcon } from "lucide-react";
import Link from "next/link";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDate } from "@/lib/helpers/format-date";
import type { Evidence } from "@/lib/types";

export type EvidenceDialogProps = {
  evidence: Evidence[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
};

export function EvidenceDialog({
  evidence,
  open,
  onOpenChange,
  onClose,
}: EvidenceDialogProps) {
  const isMobile = useIsMobile();

  const content =
    evidence.length === 0 ? (
      <div className="py-6 text-center text-muted-foreground text-sm">
        No evidence uploaded yet.
      </div>
    ) : (
      <div className="space-y-2">
        {evidence.map((item) => {
          const isLink = item.type === "LINK";
          const displayName = item.fileName || item.fileUrl;

          return (
            <div
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
              key={item.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                  {isLink ? (
                    <ExternalLink className="size-4" />
                  ) : (
                    <FileIcon className="size-4" />
                  )}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate font-medium text-sm">{displayName}</p>
                  <p className="text-muted-foreground text-xs">
                    {isLink ? "Submitted" : "Uploaded"}{" "}
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={item.fileUrl} rel="noreferrer" target="_blank">
                  {isLink ? "Open Link" : "View"}
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Evidence</DrawerTitle>
            <DrawerDescription>
              Files uploaded for this deliverable.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4">{content}</div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button onClick={onClose} type="button" variant="outline">
                Close
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
          <DialogTitle>Evidence</DialogTitle>
          <DialogDescription>
            Files uploaded for this deliverable.
          </DialogDescription>
        </DialogHeader>

        {content}

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
