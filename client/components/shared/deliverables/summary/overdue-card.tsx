import { TriangleAlert } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";

export function OverdueCard({ children }: { children?: React.ReactNode }) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        {/* <div className="rounded-md bg-error/70 p-2">
				</div>
				<div className="space-y-0">
					<FrameDescription className="text-xs">Action needed</FrameDescription>
				</div> */}
        <TriangleAlert className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Overdue
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
