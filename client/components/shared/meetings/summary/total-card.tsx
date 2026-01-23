import { FileText } from "lucide-react";
import {
	Frame,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";

export function TotalMeetingsCard({
	children,
}: {
	children?: React.ReactNode;
}) {
	return (
		<Frame>
			<FrameHeader className="flex-row items-center gap-2">
				<FileText className="size-4 text-muted-foreground" />
				<FrameTitle className="text-sm">Total</FrameTitle>
			</FrameHeader>
			<FramePanel>{children}</FramePanel>
		</Frame>
	);
}
