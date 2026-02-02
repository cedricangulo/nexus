import { ListTodo } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";

export function TotalTasksCard({ children }: { children: React.ReactNode }) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <ListTodo className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Total Tasks
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
