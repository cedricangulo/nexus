import { FileText } from "lucide-react";
import Link from "next/link";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame";
import { formatDate } from "@/lib/helpers/format-date";
import { getPhaseMeetingsList } from "@/lib/data/phases";
import type { MeetingLog } from "@/lib/types";
import { cn } from "@/lib/utils";
import AddMeetingButton from "../card-actions/add-meeting";
import Boundary from "@/components/internal/Boundary";

type Props = {
	phaseId: string;
};

export default async function PhaseMeetingsList({ phaseId }: Props) {
	const meetings = await getPhaseMeetingsList(phaseId);

	return <MeetingsListUI meetings={meetings} phaseId={phaseId} />;
}

type MeetingsListUIProps = {
	meetings: MeetingLog[];
	phaseId: string;
};

async function MeetingsListUI({ meetings, phaseId }: MeetingsListUIProps) {
	"use cache";

	return (
		<Boundary rendering="static" hydration="server" cached>
			<Frame>
				<FrameHeader className="flex-row items-center justify-between p-4">
					<FrameTitle>Meeting Minutes</FrameTitle>
					<AddMeetingButton phaseId={phaseId} />
				</FrameHeader>
				<FramePanel className="space-y-2 p-2">
					{meetings.length === 0 ? (
						<p className="py-4 text-center text-muted-foreground text-sm">No meeting yet</p>
					) : (
						meetings.map((log) => (
							<Link
								className={cn(
									"flex items-center gap-3 rounded-md border bg-card p-3",
									"transition-colors hover:bg-accent/50"
								)}
								href={log.fileUrl}
								key={log.id}
								rel="noopener noreferrer"
								target="_blank"
							>
								<FileText className="size-4 shrink-0 text-muted-foreground" />
								<div className="flex-1 overflow-hidden">
									<h4 className="truncate font-medium text-sm">{log.title}</h4>
									<p className="text-muted-foreground text-xs">{formatDate(log.date)}</p>
								</div>
							</Link>
						))
					)}
				</FramePanel>
			</Frame>
		</Boundary>
	);
}
