import { cacheLife } from "next/cache";
import { FrameDescription } from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
import { getOnTimeData, type MeetingFilters } from "@/lib/data/meetings";

type Props = {
	filters: MeetingFilters;
	token: string;
};

/**
 * OnTime Data Component
 * Fetches and displays on-time percentage of meetings
 */
export async function OnTime({ filters, token }: Props) {
	"use cache";
	cacheLife("minutes");

	const onTime = await getOnTimeData(token, filters);

	return (
		<div className="flex items-center gap-4">
			<OnTimePercentage percentage={onTime.percentage} />
			<div className="w-full">
				<Progress className="mb-2 h-2" value={onTime.percentage} />
				<FrameDescription className="line-clamp-1 text-xs">
					{onTime.onTime} of {onTime.total}
				</FrameDescription>
			</div>
		</div>
	);
}

export function OnTimePercentage({ percentage }: { percentage: number }) {
	return <h4 className="font-bold font-sora text-3xl">{percentage}%</h4>;
}

/**
 * OnTime Mobile Summary Component
 * Wrapper for mobile summary that fetches and displays only the percentage
 */
export async function OnTimePercentageWrapper({ filters, token }: Props) {
	"use cache";
	cacheLife("minutes");

	const onTime = await getOnTimeData(token, filters);

	return <OnTimePercentage percentage={onTime.percentage} />;
}
