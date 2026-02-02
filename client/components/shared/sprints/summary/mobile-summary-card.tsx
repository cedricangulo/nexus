import { IterationCcw } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";

export function MobileSummaryCard({ children }: { children: React.ReactNode }) {
  return (
    <Frame className="sm:hidden">
      <FrameHeader className="flex-row items-center gap-2">
        <IterationCcw className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Sprint Summary
        </FrameTitle>
      </FrameHeader>
      <FramePanel className="divide grid grid-cols-3 divide-x divide-dashed p-2 text-center">
        {children}
      </FramePanel>
    </Frame>
  );
}
