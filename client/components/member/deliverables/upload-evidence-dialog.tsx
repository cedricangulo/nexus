"use client";

import { Upload, X } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadEvidenceAction } from "@/actions/evidence";
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
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { useIsMobile } from "@/hooks/use-mobile";

type UploadEvidenceDialogProps = {
  deliverableId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function UploadEvidenceDialog({
  deliverableId,
  open,
  onOpenChange,
  onSuccess,
}: UploadEvidenceDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();
  const [files, setFiles] = useState<File[]>([]);

  const maxSize = 10 * 1024 * 1024; // 10MB

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!(newOpen || isPending)) {
      setFiles([]);
      onOpenChange(false);
    } else if (newOpen) {
      onOpenChange(true);
    }
  }, [isPending, onOpenChange]);

  const handleUpload = useCallback(async () => {
    const file = files[0];
    if (!file) {
      return;
    }

    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append("deliverableId", deliverableId);
      formData.append("file", file);

      startTransition(async () => {
        const result = await uploadEvidenceAction({ success: false }, formData);

        if (result.success) {
          toast.success("Evidence uploaded successfully", {
            description:
              "Deliverable status changed to Review. Add comments below if needed.",
          });

          // Close dialog after short delay
          setTimeout(() => {
            handleOpenChange(false);
            onSuccess?.();
          }, 500);
        } else {
          toast.error(result.error || "Upload failed");
        }
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }, [files, deliverableId, onSuccess, handleOpenChange]);

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${file.name.length > 30 ? `${file.name.slice(0, 30)}...` : file.name}" was rejected`,
    });
  }, []);

  const formContent = (
    <FileUpload
      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
      className="w-full"
      disabled={isPending}
      maxFiles={1}
      maxSize={maxSize}
      multiple={false}
      onAccept={(acceptedFiles) => setFiles(acceptedFiles)}
      onFileReject={onFileReject}
    >
      <FileUploadDropzone>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm">Select evidence file</p>
            <p className="text-muted-foreground text-xs">
              Drag & drop or click to browse
            </p>
            <p className="text-muted-foreground text-xs">
              PDF or images (max 10MB)
            </p>
          </div>
        </div>
        <FileUploadTrigger asChild>
          <Button className="mt-3 w-fit" size="sm" variant="outline">
            Browse files
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList>
        {files.map((file, index) => (
          <FileUploadItem key={index} value={file}>
            <div className="flex w-full items-center gap-2">
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemDelete asChild>
                <Button
                  className="size-7"
                  disabled={isPending}
                  size="icon"
                  variant="ghost"
                >
                  <X className="size-4" />
                </Button>
              </FileUploadItemDelete>
            </div>
            <FileUploadItemProgress />
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={handleOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Upload Evidence</DrawerTitle>
            <DrawerDescription>
              Upload a file to fulfill this deliverable. The status will Select
              a file to fulfill this deliverable. The status will automatically
              change to Review after upload.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{formContent}</div>
          <DrawerFooter>
            <Button
              disabled={files.length === 0 || isPending}
              onClick={handleUpload}
            >
              {isPending ? "Uploading..." : "Upload"}
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
          <DialogTitle>Upload Evidence</DialogTitle>
          <DialogDescription>
            Select a file to fulfill this deliverable. The status will
            automatically change to Review after upload.
          </DialogDescription>
        </DialogHeader>
        {formContent}
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isPending} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={files.length === 0 || isPending}
            onClick={handleUpload}
          >
            {isPending ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
