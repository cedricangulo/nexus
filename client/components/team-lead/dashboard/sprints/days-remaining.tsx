"use cache";

import { cacheLife } from "next/cache";
import { getSprintMetrics } from "@/lib/data/analytics";

export async function DaysRemaining({ token }: { token: string }) {
  cacheLife("minutes");

  const metrics = await getSprintMetrics(token);

  if (metrics.daysRemaining === null) {
    return (
      <div className="text-muted-foreground text-sm">No active sprint</div>
    );
  }

  return (
    <div className="flex items-baseline gap-2">
      <h4 className="font-bold font-sora text-3xl tabular-nums">
        {metrics.daysRemaining}
      </h4>
      <p className="text-muted-foreground text-xs">Days Left</p>
    </div>
  );
}
