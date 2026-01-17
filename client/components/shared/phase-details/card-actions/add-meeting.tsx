"use client";

// Role visibility: TEAM_LEAD and MEMBER only

import { Upload } from "lucide-react";
import { useState } from "react";
import Boundary from "@/components/internal/Boundary";
import { UploadMeetingDialog } from "@/components/shared/phases/dialogs/upload-meeting-dialog";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/providers/auth-context-provider";

type Props = {
  phaseId: string;
};

export default function AddMeetingButton({ phaseId }: Props) {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);

  // Only TEAM_LEAD and MEMBER can upload meetings
  if (user?.role === "ADVISER") {
    return null;
  }

  return (
    <>
      <Boundary hydration="client">
        <Button onClick={() => setOpen(true)} size="sm" variant="secondary">
          <Upload size={16} />
          Upload
        </Button>
      </Boundary>

      {open && (
        <UploadMeetingDialog
          onOpenChange={setOpen}
          open={open}
          phaseId={phaseId}
        />
      )}
    </>
  );
}
