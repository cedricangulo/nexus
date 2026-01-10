import { Suspense } from "react";
import { DeliverableListSkeleton } from "@/components/layouts/loading";
import DeliverablesPage from "@/components/shared/deliverables/deliverables-page";

export const metadata = {
	title: "Deliverables",
	description: "Review and manage deliverables and evidence",
};

export default function Page() {
	return (
		<Suspense fallback={<DeliverableListSkeleton />}>
			<DeliverablesPage />
		</Suspense>
	);
}
