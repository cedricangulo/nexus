"use cache";

import { cacheLife } from "next/cache";
import { getDashboardOverview } from "@/lib/data/analytics";

interface Props {
  token: string;
}

export async function TotalTasks({ token }: Props) {
  cacheLife("minutes");

  const data = await getDashboardOverview(token);

  return (
    <h4 className="font-bold font-sora text-3xl">{data?.totalTasks ?? 0}</h4>
  );
}
