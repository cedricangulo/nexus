import { FileText } from "lucide-react";
import {
	Frame,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";

export function MobileSummaryCard({ children }: { children: React.ReactNode }) {
	return (
		<Frame className="sm:hidden">
			<FrameHeader className="flex-row items-center gap-2">
				<FileText className="size-4 text-muted-foreground" />
				<FrameTitle>Deliverables Summary</FrameTitle>
			</FrameHeader>
			<FramePanel className="divide grid grid-cols-3 divide-x divide-dashed text-center p-2">
				{children}
			</FramePanel>
		</Frame>
	);
}
