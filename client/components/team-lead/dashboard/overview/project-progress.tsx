"use cache";

import { cacheLife } from "next/cache";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { getDashboardOverview } from "@/lib/data/analytics";

export async function ProjectProgress({ token }: { token: string }) {
  cacheLife("minutes");

  const data = await getDashboardOverview(token);

  const progress = data?.projectProgress ?? 0;

  return (
    <div className="flex items-center justify-between gap-4">
      <h4 className="font-bold font-sora text-3xl">{progress}%</h4>
      <ProgressCircle
        color="stroke-chart-1"
        progress={progress}
        size={32}
        strokeWidth={4}
        withoutText
      />
    </div>
  );
}
