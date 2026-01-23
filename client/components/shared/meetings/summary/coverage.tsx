import { cacheLife } from "next/cache";
import { FrameDescription } from "@/components/ui/frame";
import { Progress } from "@/components/ui/progress";
import { getCoverageData, type MeetingFilters } from "@/lib/data/meetings";

type Props = {
	filters: MeetingFilters;
	token: string;
};

/**
 * Coverage Data Component
 * Fetches and displays coverage percentage of meetings
 */
export async function Coverage({ filters, token }: Props) {
	"use cache";
	cacheLife("minutes");

	const coverage = await getCoverageData(token, filters);

	return (
		<div className="flex items-center gap-4">
			<CoveragePercentage percentage={coverage.percentage} />
			<div className="w-full">
				<Progress className="mb-2 h-2" value={coverage.percentage} />
				<FrameDescription className="line-clamp-1 text-xs">
					{coverage.covered} of {coverage.total}
				</FrameDescription>
			</div>
		</div>
	);
}

export function CoveragePercentage({ percentage }: { percentage: number }) {
	return <h4 className="font-bold font-sora text-3xl">{percentage}%</h4>;
}

/**
 * Coverage Mobile Summary Component
 * Wrapper for mobile summary that fetches and displays only the percentage
 */
export async function CoveragePercentageWrapper({ filters, token }: Props) {
	"use cache";
	cacheLife("minutes");

	const coverage = await getCoverageData(token, filters);

	return <CoveragePercentage percentage={coverage.percentage} />;
}
