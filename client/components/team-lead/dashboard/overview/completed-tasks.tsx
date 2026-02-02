"use cache";

import { cacheLife } from "next/cache";
import { getDashboardOverview } from "@/lib/data/analytics";

interface Props {
  token: string;
}

export async function CompletedTasks({ token }: Props) {
  cacheLife("minutes");

  const data = await getDashboardOverview(token);

  return (
    <h4 className="font-bold font-sora text-3xl">
      {data?.completedTasks ?? 0}
    </h4>
  );
}
