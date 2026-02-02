import { Barcode } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";

export function TimelineCard({ children }: { children?: React.ReactNode }) {
  return (
    <Frame className="sm:col-span-2 lg:col-span-1">
      <FrameHeader className="flex-row items-center gap-2">
        <Barcode className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Deliverables Timeline
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
