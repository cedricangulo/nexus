"use client";

import { Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
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
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { useIsMobile } from "@/hooks/use-mobile";

export type AutoUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  accept: string;
  maxSize: number;
  maxFiles?: number;
  onUpload: (files: File[]) => Promise<void>;
  onSuccess?: () => void;
  renderMetadataForm?: (props: {
    file: File | null;
    onSubmit: () => void;
    isUploading: boolean;
  }) => React.ReactNode;
  requiresConfirmation?: boolean; // If true, shows Upload button instead of auto-upload
};

/**
 * Centralized auto-upload dialog component
 * Supports two modes:
 * 1. Simple mode (no metadata): File selection triggers immediate upload
 * 2. Form mode (with metadata): Renders metadata form, upload after validation
 */
export function AutoUploadDialog({
  open,
  onOpenChange,
  title,
  description,
  accept,
  maxSize,
  maxFiles = 1,
  onUpload,
  onSuccess,
  renderMetadataForm,
  requiresConfirmation = false,
}: AutoUploadDialogProps) {
  const isMobile = useIsMobile();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const hasMetadataForm = !!renderMetadataForm;
  const showUploadButton = requiresConfirmation || hasMetadataForm;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!(newOpen || isUploading)) {
        setFiles([]);
        onOpenChange(false);
      } else if (newOpen) {
        onOpenChange(true);
      }
    },
    [isUploading, onOpenChange]
  );

  const handleFileReject = useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${file.name.length > 30 ? `${file.name.slice(0, 30)}...` : file.name}" was rejected`,
    });
  }, []);

  const handleUpload = useCallback(
    async (filesToUpload: File[]) => {
      setIsUploading(true);

      try {
        await onUpload(filesToUpload);

        // Auto-close after successful upload
        setTimeout(() => {
          handleOpenChange(false);
          onSuccess?.();
        }, 500);
      } catch (error) {
        console.error("[AutoUploadDialog] Upload error:", error);
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, onSuccess, handleOpenChange]
  );

  const fileUploadContent = (
    <FileUpload
      accept={accept}
      className="w-full"
      disabled={isUploading}
      maxFiles={maxFiles}
      maxSize={maxSize}
      multiple={maxFiles > 1}
      onAccept={(acceptedFiles) => setFiles(acceptedFiles)}
      onFileReject={handleFileReject}
      onUpload={showUploadButton ? undefined : handleUpload}
    >
      <FileUploadDropzone>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm">Select file</p>
            <p className="text-muted-foreground text-xs">
              Drag & drop or click to browse
            </p>
            <p className="text-muted-foreground text-xs">
              Max {Math.round(maxSize / (1024 * 1024))}MB
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
                  disabled={isUploading}
                  size="icon"
                  variant="ghost"
                >
                  <X className="size-4" />
                </Button>
              </FileUploadItemDelete>
            </div>
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  );

  const content = hasMetadataForm ? (
    <div className="space-y-4">
      {renderMetadataForm({
        file: files[0] || null,
        onSubmit: () => {
          if (files.length > 0) {
            handleUpload(files);
          }
        },
        isUploading,
      })}
      {fileUploadContent}
    </div>
  ) : (
    fileUploadContent
  );

  const uploadButton = showUploadButton && (
    <Button
      disabled={files.length === 0 || isUploading}
      onClick={() => {
        if (files.length > 0) {
          handleUpload(files);
        }
      }}
    >
      {isUploading ? "Uploading..." : "Upload"}
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={handleOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{content}</div>
          {showUploadButton && (
            <DrawerFooter>
              {uploadButton}
              <DrawerClose asChild>
                <Button disabled={isUploading} variant="outline">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
        {showUploadButton && (
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isUploading} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            {uploadButton}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
