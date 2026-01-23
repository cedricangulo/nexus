import { CircleDashed } from "lucide-react";
import {
	Frame,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";

export function UpcomingCard({ children }: { children: React.ReactNode }) {
	return (
		<Frame>
			<FrameHeader className="flex-row items-center gap-2">
				<CircleDashed className="size-4 text-muted-foreground" />
				<FrameTitle>Upcoming</FrameTitle>
			</FrameHeader>
			<FramePanel>{children}</FramePanel>
		</Frame>
	);
}
