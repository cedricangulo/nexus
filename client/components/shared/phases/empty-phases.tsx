"use client";

import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useIsTeamLead } from "@/providers/auth-context-provider";

export default function EmptyPhases() {
	const isTeamLead = useIsTeamLead();

  console.log("[EMPTY PHASES]:", isTeamLead);

	return (
		<Empty className="border py-12">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<FolderPlus />
				</EmptyMedia>
				<EmptyTitle>No Phases Created</EmptyTitle>
				{!isTeamLead ? (
					<EmptyDescription>
						No phases have been created yet. Please wait for the team lead to set up the project.
					</EmptyDescription>
				) : (
					<EmptyDescription>
						Get started by creating your first project phase in the methodology settings.
					</EmptyDescription>
				)}
			</EmptyHeader>
			{!isTeamLead ? null : (
				<EmptyContent>
					<Button
						asChild
						variant="secondary"
					>
						<Link href="/settings/project-config#methodology">
							<FolderPlus /> Create Phase
						</Link>
					</Button>
				</EmptyContent>
			)}
		</Empty>
	);
}
