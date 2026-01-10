"use client";

import { Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
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
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { linkEvidenceSchema } from "@/lib/validation";

export type AutoUploadDialogProps = {
  control: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };
  content: {
    title: string;
    description: string;
  };
  config: {
    accept: string;
    maxSize: number;
    maxFiles?: number;
    requiresConfirmation?: boolean;
  };
  handlers: {
    onUpload: (files: File[]) => Promise<void>;
    onSuccess?: () => void;
  };
  features?: {
    showLinkTab?: boolean;
    onLinkSubmit?: (link: string, fileName?: string) => Promise<void>;
    renderMetadataForm?: (props: {
      file: File | null;
      onSubmit: () => void;
      isUploading: boolean;
    }) => React.ReactNode;
  };
};

/**
 * Centralized auto-upload dialog component
 * Supports two modes:
 * 1. Simple mode (no metadata): File selection triggers immediate upload
 * 2. Form mode (with metadata): Renders metadata form, upload after validation
 *
 * Supports optional link submission tab
 */
export function AutoUploadDialog({
  control: { open, onOpenChange },
  content: { title, description },
  config: { accept, maxSize, maxFiles = 1, requiresConfirmation = false },
  handlers: { onUpload, onSuccess },
  features = {},
}: AutoUploadDialogProps) {
  const { showLinkTab = false, onLinkSubmit, renderMetadataForm } = features;
  const isMobile = useIsMobile();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Link state
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [activeTab, setActiveTab] = useState("file");

  const hasMetadataForm = !!renderMetadataForm;
  const showUploadButton = requiresConfirmation || hasMetadataForm;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!(newOpen || isUploading)) {
        setFiles([]);
        setLinkUrl("");
        setLinkName("");
        setActiveTab("file");
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

  const handleLinkSubmit = useCallback(async () => {
    if (!(onLinkSubmit && linkUrl)) {
      return;
    }

    // Validate using Zod schema
    const result = linkEvidenceSchema.safeParse({
      link: linkUrl,
      fileName: linkName || undefined,
    });

    if (!result.success) {
      const errors = result.error.flatten();
      const errorMessage = errors.fieldErrors.link?.[0] || "Validation failed";
      toast.error("Invalid input", {
        description: errorMessage,
      });
      return;
    }

    setIsUploading(true);
    try {
      await onLinkSubmit(linkUrl, linkName);

      setTimeout(() => {
        handleOpenChange(false);
        onSuccess?.();
      }, 500);
    } catch (error) {
      console.error("[AutoUploadDialog] Link submission error:", error);
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setIsUploading(false);
    }
  }, [onLinkSubmit, linkUrl, linkName, onSuccess, handleOpenChange]);

  const fileUploadContent = (
    <>
      <Tabs
        className="w-full"
        defaultValue="file"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        {showLinkTab && (
          <TabsList className="w-full">
            <TabsTrigger className="flex-1" value="file">
              Upload File
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="link">
              Submit Link
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent className="mt-4" value="file">
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
                        disabled={isUploading}
                        size="icon"
                        variant="ghost"
                      >
                        <X />
                      </Button>
                    </FileUploadItemDelete>
                  </div>
                </FileUploadItem>
              ))}
            </FileUploadList>
          </FileUpload>
        </TabsContent>

        {showLinkTab && (
          <TabsContent className="mt-4 space-y-4" value="link">
            <div className="space-y-4 rounded-md border p-4">
              <div className="space-y-2">
                <Label htmlFor="link-url">
                  Link URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  disabled={isUploading}
                  id="link-url"
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  value={linkUrl}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-name">Display Name (Optional)</Label>
                <Input
                  disabled={isUploading}
                  id="link-name"
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="e.g. Figma Prototype"
                  value={linkName}
                />
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </>
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

  const uploadButton = (
    <Button
      disabled={
        isUploading ||
        (activeTab === "file" && files.length === 0) ||
        (activeTab === "link" && !linkUrl)
      }
      onClick={() => {
        if (activeTab === "file" && files.length > 0) {
          handleUpload(files);
        } else if (activeTab === "link" && linkUrl) {
          handleLinkSubmit();
        }
      }}
    >
      {isUploading ? (
        <>
          <Spinner /> {activeTab === "file" ? "Uploading" : "Submitting"}
        </>
      ) : (
        <>
          <Upload /> {activeTab === "file" ? "Upload" : "Submit Link"}
        </>
      )}
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
          <DrawerFooter>
            {(showUploadButton || activeTab === "link") && uploadButton}
            <DrawerClose asChild>
              <Button disabled={isUploading} variant="outline">
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isUploading} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          {(showUploadButton || activeTab === "link") && uploadButton}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
