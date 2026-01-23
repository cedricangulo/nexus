import { AlertCircle } from "lucide-react";
import {
	Frame,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";

export function MissingMeetingsCard({
	children,
}: {
	children?: React.ReactNode;
}) {
	return (
		<Frame>
			<FrameHeader className="flex-row items-center gap-2">
				<AlertCircle className="size-4 text-muted-foreground" />
				<FrameTitle className="text-sm">Missing</FrameTitle>
			</FrameHeader>
			<FramePanel>{children}</FramePanel>
		</Frame>
	);
}
