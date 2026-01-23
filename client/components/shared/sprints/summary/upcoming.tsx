"use cache";

import { cacheLife } from "next/cache";
import { getFilteredSprints, type SprintFilters } from "@/lib/data/sprint";
import { getSprintStatus } from "@/lib/helpers/sprint";
import type { User } from "@/lib/types";

type Props = {
	filters: SprintFilters;
	token: string;
	user: User;
};

export async function Upcoming({ filters, token, user }: Props) {
	cacheLife("minutes");

	const sprints = await getFilteredSprints(token, user.role, filters);

	const now = new Date();

	const upcomingCount = sprints.filter(
		(sprint) => getSprintStatus(sprint, now) === "UPCOMING",
	).length;

	return <h4 className="font-bold font-sora text-3xl">{upcomingCount}</h4>;
}
