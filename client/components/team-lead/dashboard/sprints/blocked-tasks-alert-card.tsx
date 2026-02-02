import { AlertCircle } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";

export function BlockedTasksAlertCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <AlertCircle className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Blocked Tasks
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
