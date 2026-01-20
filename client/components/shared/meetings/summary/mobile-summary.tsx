import { FileText } from "lucide-react";
import { Suspense } from "react";
import {
	Frame,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getCoverageData,
	getMissingMeetingsData,
	getOnTimeData,
	getTotalMeetingsData,
} from "@/lib/data/meetings";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { meetingSearchParamsCache } from "@/lib/types/search-params";

/**
 * Simplified mobile versions of analytics components
 * Only shows the main metric without extra details
 */

type MobileMetricProps = {
	searchParams: Record<string, string | string[] | undefined>;
};

async function TotalMobile({ searchParams }: MobileMetricProps) {
	const { token } = await getAuthContext();
	const filters = meetingSearchParamsCache.parse(searchParams);
	const total = await getTotalMeetingsData(token, filters);
	return <p className="font-bold font-sora text-3xl">{total}</p>;
}

async function CoverageMobile({ searchParams }: MobileMetricProps) {
	const { token } = await getAuthContext();
	const filters = meetingSearchParamsCache.parse(searchParams);
	const coverage = await getCoverageData(token, filters);
	return <p className="font-bold font-sora text-3xl">{coverage.percentage}%</p>;
}

async function OnTimeMobile({ searchParams }: MobileMetricProps) {
	const { token } = await getAuthContext();
	const filters = meetingSearchParamsCache.parse(searchParams);
	const onTime = await getOnTimeData(token, filters);
	return <p className="font-bold font-sora text-3xl">{onTime.percentage}%</p>;
}

async function MissingMobile({ searchParams }: MobileMetricProps) {
	const { token } = await getAuthContext();
	const filters = meetingSearchParamsCache.parse(searchParams);
	const missing = await getMissingMeetingsData(token, filters);
	return <p className="font-bold font-sora text-3xl">{missing.count}</p>;
}

export const SUMMARY_ITEMS = [
	{
		label: "Total",
		Component: TotalMobile,
		colorClass: "text-info-foreground",
	},
	{
		label: "Coverage",
		Component: CoverageMobile,
		colorClass: "text-success-foreground",
	},
	{
		label: "On-Time",
		Component: OnTimeMobile,
		colorClass: "text-scrum-foreground",
	},
	{
		label: "Missing",
		Component: MissingMobile,
		colorClass: "text-info-foreground",
	},
] as const;

export function SummaryCardItem({
	label,
	Component,
	colorClass,
	searchParams,
}: {
	label: string;
	Component: React.ComponentType<MobileMetricProps>;
	colorClass: string;
	searchParams: Record<string, string | string[] | undefined>;
}) {
	return (
		<div className={colorClass}>
			<Suspense fallback={<Skeleton className="mx-auto h-9 w-12" />}>
				<Component searchParams={searchParams} />
			</Suspense>
			<span className="text-muted-foreground text-xs">{label}</span>
		</div>
	);
}

export async function MobileSummary({
	children,
}: {
	children: React.ReactNode;
}) {
	"use cache";

	return (
		<Frame className="sm:hidden">
			<FrameHeader className="flex-row items-center gap-2">
				<FileText className="size-4 text-muted-foreground" />
				<FrameTitle>Meeting Summary</FrameTitle>
			</FrameHeader>
			<FramePanel className="divide grid grid-cols-4 divide-x divide-dashed p-2 text-center">
				{children}
			</FramePanel>
		</Frame>
	);
}
