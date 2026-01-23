"use cache";

import { cacheLife } from "next/cache";
import {
	type DeliverablesFilters,
	getOverdueDeliverablesCount,
} from "@/lib/data/deliverables";

type Props = {
	filters: DeliverablesFilters;
	token: string;
};

/**
 *
 * @param filters
 * @param token
 * @returns
 */
export async function Overdue({ filters, token }: Props) {
	cacheLife("minutes");

	const overdue = await getOverdueDeliverablesCount(token, filters);

	return <p className="font-bold text-3xl">{overdue}</p>;
}
