import { DeliverableItem } from "./deliverable-item";
import { Frame, FrameHeader, FrameTitle } from "@/components/ui/frame";
import { getPhaseDeliverablesList } from "@/lib/data/phases";
import type { Deliverable } from "@/lib/types";
import AddDeliverableButton from "./add-deliverable";
import { DeliverableActions } from "./deliverable-item-client";

type Props = {
	phaseId: string;
};

/**
 * CONTAINER (Dynamic)
 * Fetches deliverables using cookies internally.
 * Cannot use "use cache" because getPhaseDeliverablesList accesses dynamic data.
 */
export default async function PhaseDeliverablesList({ phaseId }: Props) {
	const deliverables = await getPhaseDeliverablesList(phaseId);

	if (deliverables.length === 0) {
		return (
			<div className="py-8 text-center text-muted-foreground text-sm">
				No deliverables found for this phase
			</div>
		);
	}

	return <CachedDeliverablesListUI deliverables={deliverables} phaseId={phaseId} />;
}

/**
 * PRESENTER (Static Shell)
 * Receives deliverables as props, safe to cache.
 */
async function CachedDeliverablesListUI({ deliverables, phaseId }: { deliverables: Deliverable[], phaseId: string }) {
	"use cache";

	return (
		<Frame stackedPanels>
			<FrameHeader className="p-4">
				<div className="flex items-center justify-between gap-2">
					<FrameTitle>Deliverables</FrameTitle>
					<AddDeliverableButton phaseId={phaseId} />
				</div>
			</FrameHeader>
			{deliverables.map((deliverable) => (
				<DeliverableItem key={deliverable.id} deliverable={deliverable}>
					<DeliverableActions deliverable={deliverable} />
				</DeliverableItem>
			))}
		</Frame>
	);
}
