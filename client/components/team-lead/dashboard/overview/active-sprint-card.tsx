import { IterationCcw } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";

export function ActiveSprintCard({ children }: { children: React.ReactNode }) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <IterationCcw className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Active Sprint
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
