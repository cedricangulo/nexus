import { CircleDot } from "lucide-react";
import {
	Frame,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";

export function ActiveCard({ children }: { children: React.ReactNode }) {
	return (
		<Frame>
			<FrameHeader className="flex-row items-center gap-2">
				<CircleDot className="size-4 text-muted-foreground" />
				<FrameTitle>Active</FrameTitle>
			</FrameHeader>
			<FramePanel>{children}</FramePanel>
		</Frame>
	);
}
