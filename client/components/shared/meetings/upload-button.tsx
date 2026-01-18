"use client";

import { UploadIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Phase, Sprint } from "@/lib/types";
import { UploadMinutesDialog } from "./upload-minutes-dialog";

type UploadMinutesButtonProps = {
  sprints: Sprint[];
  phases: Phase[];
};

export function UploadMinutesButton({
  sprints,
  phases,
}: UploadMinutesButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="w-full md:w-fit" onClick={() => setOpen(true)}>
        <UploadIcon className="opacity-60" size={16} />
        Upload
      </Button>
      <UploadMinutesDialog
        onOpenChange={setOpen}
        open={open}
        phases={phases}
        sprints={sprints}
      />
    </>
  );
}
