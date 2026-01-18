"use client";

import { Plus } from "lucide-react";
import Boundary from "@/components/internal/Boundary";
import { DeliverableCreateDialog } from "@/components/shared/phases/dialogs/create-deliverable-dialog";
import { Button } from "@/components/ui/button";
import { usePhaseActions } from "@/hooks/use-phase-actions";
import { useIsTeamLead } from "@/providers/auth-context-provider";

export default function AddDeliverableButton({ phaseId }: { phaseId: string }) {
  const isTeamLead = useIsTeamLead();

  if (!isTeamLead) {
    return null;
  }

  const {
    handleCreateDeliverable,
    createDeliverableOpen,
    setCreateDeliverableOpen,
  } = usePhaseActions(phaseId);

  return (
    <>
      <Boundary hydration="client">
        <Button onClick={handleCreateDeliverable} size="sm" variant="secondary">
          <Plus />
          Add
        </Button>
      </Boundary>

      {/* DIALOG HERE */}
      {createDeliverableOpen ? (
        <DeliverableCreateDialog
          onOpenChange={setCreateDeliverableOpen}
          open={createDeliverableOpen}
          phaseId={phaseId}
        />
      ) : null}
    </>
  );
}
