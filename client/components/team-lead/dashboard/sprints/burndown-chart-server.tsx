import { Activity } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getCurrentSprintBurndown } from "@/lib/data/analytics";
import { BurndownChartClient } from "./burndown-chart";

export async function BurndownChart({ token }: { token: string }) {
  const data = await getCurrentSprintBurndown(token);

  return <BurndownChartClient data={data} />;
}

export function BurndownChartCard({ children }: { children: React.ReactNode }) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <Activity className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Current Sprint Burndown
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
