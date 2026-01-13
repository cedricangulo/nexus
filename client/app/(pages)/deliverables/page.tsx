import DeliverablesPage from "@/components/shared/deliverables/deliverables-page";
import Boundary from "@/components/internal/Boundary";

export const metadata = {
	title: "Deliverables",
	description: "Review and manage deliverables and evidence",
};

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function Deliverables({ searchParams }: PageProps) {
	return (
		<Boundary hydration="server" rendering="dynamic">
			<DeliverablesPage searchParams={searchParams} />
		</Boundary>
	);
}
