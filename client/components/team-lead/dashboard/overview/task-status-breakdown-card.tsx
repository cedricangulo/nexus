import { ListTodo } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";

export function TaskStatusBreakdownCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Frame className="col-span-2">
      <FrameHeader className="flex-row items-center gap-2">
        <ListTodo className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Tasks Summary
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
