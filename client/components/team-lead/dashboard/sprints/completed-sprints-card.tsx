import { CheckCircle2 } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getSprintMetrics } from "@/lib/data/analytics";
import { getAuthContext } from "@/lib/helpers/auth-token";

export async function CompletedSprints() {
  const { token } = await getAuthContext();
  const metrics = await getSprintMetrics(token);

  return (
    <div className="flex items-baseline gap-2">
      <h4 className="font-bold font-sora text-3xl tabular-nums">
        {metrics.completedSprintsCount}
      </h4>
      <p className="text-muted-foreground text-xs">Completed</p>
    </div>
  );
}

export async function CompletedSprintsCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <CheckCircle2 className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Sprints
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
