import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommentSection from "@/components/shared/deliverables-details/comment-section";
import Evidence from "@/components/shared/deliverables-details/evidence";
import HeaderButtons from "@/components/shared/deliverables-details/header-buttons";
import UploadEvidenceButton from "@/components/shared/deliverables-details/upload-evidence-button";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status";
import { getDeliverableDetail } from "@/lib/data/deliverables";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { formatDate } from "@/lib/helpers/format-date";
import { isDeliverableOverdue } from "@/lib/types/deliverables-utils";
import { cn } from "@/lib/utils";

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const { user, token } = await getAuthContext();

	const { deliverable, phase } = await getDeliverableDetail(id, token);

	if (!(deliverable && user)) {
		notFound();
	}

	const overdue = isDeliverableOverdue(deliverable);

	return (
		<div className="space-y-8">
			<div className="space-y-6">
				<div className="space-y-2">
					<div className="flex flex-wrap items-center gap-4">
						<Button asChild variant="outline" size="icon">
							<Link href="/deliverables">
								<ChevronLeftIcon />
							</Link>
						</Button>
						<h1 className="font-semibold text-2xl">{deliverable.title}</h1>
					</div>
					<p className="max-w-prose text-muted-foreground">
						{deliverable.description}
					</p>
				</div>
				<div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex flex-wrap gap-4 text-muted-foreground text-sm divide-x">
						<p className="pr-4">{phase?.name || "No phase assigned"}</p>
						{/* Hide if the deliverable is completed */}
						{deliverable.status !== "COMPLETED" ? (
							<div
								className={cn(
									"flex items-center gap-2 text-sm pr-4",
									overdue ? "text-destructive" : null,
								)}
							>
								<p className="font-semibold text-sm">Due</p>
								{deliverable.dueDate ? (
									<span>
										{overdue ? "Overdue: " : ""}
										<span
											className={cn(
												overdue ? "font-semibold" : "text-foreground",
											)}
										>
											{formatDate(deliverable.dueDate)}
										</span>
									</span>
								) : (
									<span>No Date Yet</span>
								)}
							</div>
						) : null}
						<div className="pr-4">
							{phase ? <StatusBadge status={phase.type} /> : null}
						</div>
						<div>
							<StatusBadge status={deliverable.status} />
						</div>
					</div>
					<HeaderButtons
						id={deliverable.id}
						title={deliverable.title}
						status={deliverable.status}
					/>
					<UploadEvidenceButton
						id={deliverable.id}
						status={deliverable.status}
					/>
				</div>
			</div>

			<div className="mb-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
				<Evidence deliverable={deliverable} token={token} />
				<div className="space-y-2 lg:col-span-7">
					<CommentSection id={deliverable.id} />
				</div>
			</div>
		</div>
	);
}
