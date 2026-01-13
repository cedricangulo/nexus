import { StatusBadge } from "@/components/ui/status";
import { getPhaseHeader } from "@/lib/data/phases";
import { formatDate } from "@/lib/helpers/format-date";
import { Phase } from "@/lib/types/models";

type Props = {
	phaseId: string;
};

type PhaseHeaderData = {
	id: string;
	name: string;
	type: Phase["type"];
	description: string | null | undefined;
	startDate: string | null | undefined;
	endDate: string | null | undefined;
};

/**
 * CONTAINER (Dynamic)
 * Fetches phase header using cookies internally.
 * Cannot use "use cache" because getPhaseHeader accesses dynamic data.
 */
export default async function PageHeaderContainer({ phaseId }: Props) {
	const phase = await getPhaseHeader(phaseId);

	if (!phase) return null;

	return <CachedHeaderUI phase={phase} />;
}

/**
 * PRESENTER (Static Shell)
 * Receives phase data as props, safe to cache.
 */
async function CachedHeaderUI({ phase }: { phase: PhaseHeaderData }) {
	"use cache";

	return (
		<div className="flex flex-col items-start justify-between gap-4 md:flex-row">
			<div className="space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<h1 className="font-semibold text-2xl">{phase.name}</h1>
					<StatusBadge status={phase.type} />
				</div>
				{!phase.description ? null : (
					<p className="text-muted-foreground">{phase.description}</p>
				)}
			</div>

			<div className="flex gap-4 text-sm">
				{!phase.startDate ? null : (
					<div>
						<p className="text-muted-foreground text-sm">Start Date</p>
						<p className="font-medium">{formatDate(phase.startDate)}</p>
					</div>
				)}
				{!phase.endDate ? null : (
					<div>
						<p className="text-muted-foreground text-sm">End Date</p>
						<p className="font-medium">{formatDate(phase.endDate)}</p>
					</div>
				)}
			</div>
		</div>
	);
}
