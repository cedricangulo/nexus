import { TrendingUp } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getSprintVelocityTrend } from "@/lib/data/analytics";
import { VelocityChartClient } from "./velocity-chart";

export async function VelocityChart({ token }: { token: string }) {
  const data = await getSprintVelocityTrend(token);

  return <VelocityChartClient data={data} />;
}

export function VelocityChartCard({ children }: { children: React.ReactNode }) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <TrendingUp className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Sprint Velocity Trend
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
