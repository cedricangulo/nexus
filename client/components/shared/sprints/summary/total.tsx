"use cache";

import { getFilteredSprints, SprintFilters } from "@/lib/data/sprint";
import { User } from "@/lib/types";
import { cacheLife } from "next/cache";

type Props = {
  filters: SprintFilters;
  token: string;
  user: User;
};

export async function Total({ filters, token, user }: Props) {
  cacheLife("minutes");

  const sprints = await getFilteredSprints(token, user.role, filters);

  return <h4 className="font-bold font-sora text-3xl">{sprints.length}</h4>;
}
