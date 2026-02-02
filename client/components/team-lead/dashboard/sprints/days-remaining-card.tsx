import { Clock } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";

export function DaysRemainingCard({ children }: { children: React.ReactNode }) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Time Remaining
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
