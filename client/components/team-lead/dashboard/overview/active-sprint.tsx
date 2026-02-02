"use cache";

import { cacheLife } from "next/cache";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { getActiveSprintProgress } from "@/lib/data/analytics";

interface Props {
  token: string;
}

export async function ActiveSprint({ token }: Props) {
  cacheLife("minutes");

  const data = await getActiveSprintProgress(token);

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h4 className="font-medium font-sora text-muted-foreground text-xs">
          {data?.name}
        </h4>
        <p className="text-muted-foreground text-sm">
          {data?.daysRemaining} days remaining
        </p>
      </div>
      {data?.progress ? (
        <ProgressCircle
          color="stroke-warning-foreground"
          progress={data.progress}
          size={32}
          strokeWidth={4}
          withoutText
        />
      ) : null}
    </div>
  );
}
