"use cache";

import { cacheLife } from "next/cache";
import { getDashboardOverview } from "@/lib/data/analytics";

export async function TotalSprints({ token }: { token: string }) {
  cacheLife("minutes");

  const data = await getDashboardOverview(token);

  return (
    <h4 className="font-bold font-sora text-3xl">{data?.totalSprints ?? 0}</h4>
  );
}
