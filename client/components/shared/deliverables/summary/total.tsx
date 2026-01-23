"use cache";

import { cacheLife } from "next/cache";
import {
	type DeliverablesFilters,
	getTotalDeliverablesCount,
} from "@/lib/data/deliverables";

type Props = {
	filters: DeliverablesFilters;
	token: string;
};

export async function Total({ filters, token }: Props) {
	cacheLife("minutes");

	const total = await getTotalDeliverablesCount(token, filters);

	return <div className="font-bold font-sora text-3xl">{total}</div>;
}
