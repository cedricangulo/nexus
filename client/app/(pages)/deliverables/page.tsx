// app/(pages)/deliverables/page.tsx
import Boundary from "@/components/internal/Boundary";
import DeliverablesPage from "@/components/shared/deliverables/deliverables-page";
// import { DeliverablesPage } from "@/features/deliverables";

export const metadata = {
	title: "Deliverables",
	description: "Review and manage deliverables and evidence",
};

interface PageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function Deliverables({ searchParams }: PageProps) {
	return (
		<Boundary hydration="server" rendering="dynamic">
			<DeliverablesPage searchParams={searchParams} />
		</Boundary>
	);
}
