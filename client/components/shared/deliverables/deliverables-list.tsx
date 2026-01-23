import { FolderX } from "lucide-react";
import Boundary from "@/components/internal/Boundary";
import { DeliverableItem } from "@/components/shared/deliverables/deliverable-item";
import { EmptyState } from "@/components/shared/empty-state";
import {
	type DeliverablesFilters,
	getFilteredDeliverables,
	getPhases,
} from "@/lib/data/deliverables";

type Props = {
	filters: DeliverablesFilters;
	token: string;
};

export async function DeliverablesList({ filters, token }: Props) {
	const [deliverables, phases] = await Promise.all([
		getFilteredDeliverables(token, filters),
		getPhases(token),
	]);

	// Create phase lookup for cards
	const phaseById = Object.fromEntries(phases.map((p) => [p.id, p]));

	if (deliverables.length === 0) {
		return (
			<EmptyState
				description="Try adjusting your filters or search query."
				icon={FolderX}
				title="No Deliverables Found"
			/>
		);
	}

	return (
		<section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{deliverables.map((deliverable) => {
				const phase = phaseById[deliverable.phaseId];
				return (
					<Boundary hydration="server" key={deliverable.id} rendering="dynamic">
						<DeliverableItem deliverable={deliverable} phase={phase} />
					</Boundary>
				);
			})}
		</section>
	);
}
