"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { updateProjectAction } from "@/actions/project-config";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { Project } from "@/lib/types";

/**
 * Strip https:// or http:// prefix from URL if present
 * Handles malformed URLs like "https:github.com"
 */
const STRIP_PROTOCOL_RE = /^https?:\/?\/?/i;

function stripHttps(url: string): string {
  if (!url) {
    return "";
  }
  // Remove http://, https://, and malformed https:, http:
  return url.replace(STRIP_PROTOCOL_RE, "");
}

/**
 * Add https:// prefix to URL if not present
 * Handles malformed URLs and ensures proper format
 */
function ensureHttps(url: string): string {
  if (!url) {
    return "";
  }
  // First, strip any existing protocol to avoid duplicates
  const cleaned = stripHttps(url);
  return `https://${cleaned}`;
}

type RepositorySettingsProps = {
  project: Project | null;
};

export default function RepositorySettings({
  project,
}: RepositorySettingsProps) {
  const [repositoryUrl, setRepositoryUrl] = useState(
    project?.repositoryUrl ? stripHttps(project.repositoryUrl) : ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepositoryUrl(stripHttps(value));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving repository settings...");
    try {
      const fullUrl = ensureHttps(repositoryUrl);
      const updated = await updateProjectAction({
        repositoryUrl: fullUrl || undefined,
      });

      if (updated) {
        toast.dismiss(toastId);
        toast.success("Repository settings saved successfully");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save repository settings";
      console.error("Failed to update repository:", error);
      toast.dismiss(toastId);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Frame id="repository-connection">
      <FrameHeader className="p-4">
        <FrameTitle>Repository Connection</FrameTitle>
        <FrameDescription>
          Link your GitHub or GitLab repository for automated tracking.
        </FrameDescription>
      </FrameHeader>
      <FramePanel>
        <Field>
          <FieldLabel htmlFor="github">Repository URL</FieldLabel>
          <div className="relative">
            <Input
              className="peer ps-16"
              id="github"
              onChange={handleChange}
              placeholder="github.com/your-username/your-repo"
              type="text"
              value={repositoryUrl}
            />
            <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground text-sm peer-disabled:opacity-50">
              https://
            </span>
          </div>
          {repositoryUrl ? (
            <FieldDescription>
              <Link
                className="hover:underline"
                href={ensureHttps(repositoryUrl)}
                rel="noopener noreferrer"
                target="_blank"
              >
                Open repository
              </Link>
            </FieldDescription>
          ) : null}
        </Field>
      </FramePanel>
      <FrameFooter className="flex-row justify-end">
        <Button disabled={isSaving} onClick={handleSave} variant="secondary">
          {isSaving ? (
            <>
              <Spinner /> Saving
            </>
          ) : (
            <>
              <Save /> Save Changes
            </>
          )}
        </Button>
      </FrameFooter>
    </Frame>
  );
}
