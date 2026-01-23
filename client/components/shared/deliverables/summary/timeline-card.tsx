import { Barcode } from "lucide-react";
import {
	Frame,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";

export function TimelineCard({ children }: { children?: React.ReactNode }) {
	return (
		<Frame className="sm:col-span-2 lg:col-span-1">
			<FrameHeader className="flex-row items-center gap-2">
				{/* <div className="rounded-md bg-success p-2">
				</div>
				<div className="space-y-0">
					<FrameDescription className="text-xs">
						Sorted by due date
					</FrameDescription>
				</div> */}
				<Barcode className="size-4 text-muted-foreground" />
				<FrameTitle className="text-sm">Deliverables Timeline</FrameTitle>
			</FrameHeader>
			<FramePanel>{children}</FramePanel>
		</Frame>
	);
}
