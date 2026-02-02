import { CheckCircle2 } from "lucide-react";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";

export function CompletedTasksCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <div className="rounded-md bg-success p-2">
          <CheckCircle2 className="size-4 text-muted-foreground" />
        </div>
        <div className="space-y-0">
          <FrameTitle className="font-normal text-muted-foreground text-sm">
            Completed
          </FrameTitle>
          <FrameDescription className="text-xs">Tasks</FrameDescription>
        </div>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
