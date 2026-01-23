import { Blocks } from "lucide-react";
import {
	Frame,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";

export function TotalCard({ children }: { children?: React.ReactNode }) {
	return (
		<Frame>
			<FrameHeader className="flex-row items-center gap-2">
				{/* <div className="rounded-md bg-info p-2">
				</div> */}
				<Blocks className="size-4 text-muted-foreground" />
				<FrameTitle>Total Deliverables</FrameTitle>
			</FrameHeader>
			<FramePanel>{children}</FramePanel>
		</Frame>
	);
}
