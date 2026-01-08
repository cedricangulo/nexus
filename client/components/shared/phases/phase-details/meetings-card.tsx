"use client";

import { FileText, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { usePhaseActions } from "@/hooks/use-phase-actions";
import { formatDate } from "@/lib/helpers/format-date";
import type { PhaseDetail } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UploadMeetingDialog } from "../dialogs/upload-meeting-dialog";

type MeetingsCardProp = {
  phase: PhaseDetail;
};

export default function MeetingsCard({ phase }: MeetingsCardProp) {
  const meetingLogs = phase.meetingLogs || [];

  const { meetingUploadOpen, setMeetingUploadOpen } = usePhaseActions(phase.id);

  return (
    <>
      <Frame>
        <FrameHeader className="flex-row items-center justify-between p-4">
          <FrameTitle>Meeting Minutes</FrameTitle>
          <Button
            onClick={() => setMeetingUploadOpen(true)}
            size="sm"
            variant="secondary"
          >
            <Upload size={16} />
            Upload
          </Button>
        </FrameHeader>
        <FramePanel className="space-y-2 p-2">
          {meetingLogs.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground text-sm">
              No meeting logs yet
            </p>
          ) : (
            meetingLogs.map((log) => (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-md border bg-card p-3",
                  "transition-colors hover:bg-accent/50"
                )}
                href={log.fileUrl}
                key={log.id}
                rel="noopener noreferrer"
                target="_blank"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 overflow-hidden">
                  <h4 className="truncate font-medium text-sm">{log.title}</h4>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(log.date)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </FramePanel>
      </Frame>

      <UploadMeetingDialog
        onOpenChange={setMeetingUploadOpen}
        open={meetingUploadOpen}
        phaseId={phase.id}
      />
    </>
  );
}
