import { Target } from "lucide-react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { getSprintMetrics } from "@/lib/data/analytics";
import { getAuthContext } from "@/lib/helpers/auth-token";

export async function SprintGoal() {
  const { token } = await getAuthContext();
  const metrics = await getSprintMetrics(token);

  if (!metrics.currentSprintGoal) {
    return <div className="text-muted-foreground text-sm">No sprint goal</div>;
  }

  return (
    <p className="line-clamp-2 text-pretty text-sm">
      {metrics.currentSprintGoal}
    </p>
  );
}

export async function SprintGoalCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <Target className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Sprint Goal
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
