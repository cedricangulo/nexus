"use cache";

import { getFilteredSprints, SprintFilters } from "@/lib/data/sprint";
import { getSprintStatus } from "@/lib/helpers/sprint";
import { User } from "@/lib/types";
import { cacheLife } from "next/cache";

type Props = {
	filters: SprintFilters;
	token: string;
	user: User;
};

export async function Active({ filters, token, user }: Props) {
	cacheLife("minutes");

	const sprints = await getFilteredSprints(token, user.role, filters);
	const now = new Date();

	const activeCount = sprints.filter(
		(sprint) => getSprintStatus(sprint, now) === "ACTIVE",
	).length;

	return <h4 className="font-bold font-sora text-3xl">{activeCount}</h4>;
}
