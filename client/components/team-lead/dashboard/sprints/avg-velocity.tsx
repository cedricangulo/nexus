"use cache";

import { cacheLife } from "next/cache";
import { getSprintMetrics } from "@/lib/data/analytics";

export async function AvgVelocity({ token }: { token: string }) {
  cacheLife("minutes");

  const metrics = await getSprintMetrics(token);

  return (
    <div className="flex items-baseline gap-2">
      <h4 className="font-bold font-sora text-3xl tabular-nums">
        {metrics.avgVelocity}
      </h4>
      <p className="text-muted-foreground text-xs">Avg. Velocity</p>
    </div>
  );
}
