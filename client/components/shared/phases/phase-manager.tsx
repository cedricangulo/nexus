"use client";

import { FolderPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Deliverable, PhaseDetail } from "@/lib/types";
import { useIsTeamLead } from "@/providers/auth-context-provider";
import { PhaseCard } from "./cards/phase-card";
import { DeliverableCreateDialog } from "./dialogs/create-deliverable-dialog";
import { DeliverableEditDialog } from "./dialogs/edit-deliverable-dialog";
import { PhaseEditDialog } from "./dialogs/edit-phase-dialog";

type PhaseManagerProps = {
  phases: PhaseDetail[];
};

export function PhaseManager({ phases }: PhaseManagerProps) {
  const isTeamLead = useIsTeamLead();
  console.log("[PHASE MANAGER]:", isTeamLead);

  const [editingPhase, setEditingPhase] = useState<PhaseDetail | null>(null);
  const [addingDeliverablePhaseId, setAddingDeliverablePhaseId] = useState<
    string | null
  >(null);
  const [editingDeliverable, setEditingDeliverable] =
    useState<Deliverable | null>(null);

  // Sort phases in WSF order (Waterfall → Scrum → Fall)
  const phaseOrder = ["WATERFALL", "SCRUM", "FALL"];
  const sortedPhases = [...phases].sort(
    (a, b) => phaseOrder.indexOf(a.type) - phaseOrder.indexOf(b.type)
  );

  // Empty state
  if (sortedPhases.length === 0) {
    return (
      <Empty className="border py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderPlus />
          </EmptyMedia>
          <EmptyTitle>No Phases Created</EmptyTitle>
          {isTeamLead ? (
            <EmptyDescription>
              No phases have been created yet. Please wait for the team lead to
              set up the project.
            </EmptyDescription>
          ) : (
            <EmptyDescription>
              Get started by creating your first project phase in the
              methodology settings.
            </EmptyDescription>
          )}
        </EmptyHeader>
        {isTeamLead ? null : (
          <EmptyContent>
            <Button asChild variant="secondary">
              <Link href="/settings/project-config#methodology">
                <FolderPlus /> Create Phase
              </Link>
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Phases List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {sortedPhases.map((phase) => (
          <PhaseCard
            key={phase.id}
            onEditPhase={setEditingPhase}
            phase={phase}
          />
        ))}
      </div>

      {/* Dialogs */}
      {editingPhase ? (
        <PhaseEditDialog
          onOpenChange={(open) => {
            if (!open) {
              setEditingPhase(null);
            }
          }}
          open={true}
          phase={editingPhase}
        />
      ) : null}

      {addingDeliverablePhaseId ? (
        <DeliverableCreateDialog
          onOpenChange={(open) => {
            if (!open) {
              setAddingDeliverablePhaseId(null);
            }
          }}
          open={true}
          phaseId={addingDeliverablePhaseId}
        />
      ) : null}

      {editingDeliverable ? (
        <DeliverableEditDialog
          deliverable={editingDeliverable}
          onOpenChange={(open) => {
            if (!open) {
              setEditingDeliverable(null);
            }
          }}
          open={true}
        />
      ) : null}
    </div>
  );
}
