"use cache";

import { cacheLife } from "next/cache";
import { Badge } from "@/components/ui/badge";
import { getSprintMetrics } from "@/lib/data/analytics";

export async function BlockedTasks({ token }: { token: string }) {
  cacheLife("minutes");

  const metrics = await getSprintMetrics(token);

  const isBlocked = metrics.blockedTasksCount > 0;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-baseline gap-2">
        <h4 className="font-bold font-sora text-3xl tabular-nums">
          {metrics.blockedTasksCount}
        </h4>
        <p className="text-muted-foreground text-xs">Blocked</p>
      </div>
      {isBlocked ? (
        <Badge className="shrink-0" variant="error">
          Alert
        </Badge>
      ) : (
        <Badge className="shrink-0" variant="success">
          Stable
        </Badge>
      )}
    </div>
  );
}
