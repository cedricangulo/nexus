import { notFound } from "next/navigation";
import CommentSection from "@/components/shared/deliverables/comment-section";
import { getDeliverableDetail } from "@/lib/data/deliverables";
import { getAuthContext } from "@/lib/helpers/auth-token";
import HeaderButtons from "@/components/adviser/deliverables-details/header-buttons";
import { StatusBadge } from "@/components/ui/status";
import { cn } from "@/lib/utils";
import { isDeliverableOverdue } from "@/lib/types/deliverables-utils";
import { Calendar, FileIcon } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/helpers/format-date";
import { Separator } from "@/components/ui/separator";
import UploadEvidenceButton from "@/components/adviser/deliverables-details/upload-evidence-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Evidence from "@/components/adviser/deliverables-details/evidence";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const { user, token } = await getAuthContext();

	const { deliverable, phase, evidence } = await getDeliverableDetail(id, token);

	if (!(deliverable && user)) {
		notFound();
	}

	const overdue = isDeliverableOverdue(deliverable);

	return (
		<div className="space-y-8">
			<HeaderButtons
				id={deliverable.id}
        title={deliverable.title}
				status={deliverable.status}
			/>

			<div className="space-y-2">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-2">
						<h1 className="font-semibold text-2xl">{deliverable.title}</h1>
						<div className="flex items-center gap-2">
							<p className="text-muted-foreground">{phase?.name || "No phase assigned"}</p>
							<div className="flex flex-wrap items-center gap-2">
								<StatusBadge status={deliverable.status} />
								{phase ? <StatusBadge status={phase.type} /> : null}
							</div>
						</div>
					</div>
					{deliverable.dueDate ? (
						<div className="space-y-2">
							<p className="font-semibold text-foreground text-sm">Due Date</p>
							<div
								className={cn(
									"flex items-center gap-2 text-sm",
									overdue ? "text-destructive" : "text-muted-foreground"
								)}
							>
								<Calendar size={16} />
								{deliverable.dueDate ? (
									<span>
										{overdue ? "Overdue: " : ""}
										<span className={cn(overdue ? "font-semibold" : "text-foreground")}>
											{formatDate(deliverable.dueDate)}
										</span>
									</span>
								) : null}
							</div>
						</div>
					) : null}
				</div>
				<p className="max-w-prose text-muted-foreground">{deliverable.description}</p>
			</div>

			<Separator />

			<div className="mb-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
				<Evidence deliverable={deliverable} token={token} />
				<div className="space-y-2 lg:col-span-7">
					<CommentSection id={deliverable.id} />
				</div>
			</div>
		</div>
	);
}
