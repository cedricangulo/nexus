"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { usePhaseActions } from "@/hooks/use-phase-actions";
import type { PhaseDetail } from "@/lib/types";
import { useIsTeamLead } from "@/providers/auth-context-provider";
import { DeliverableItem } from "../cards/deliverable-item";
import { DeliverableCreateDialog } from "../dialogs/create-deliverable-dialog";
import { DeliverableEditDialog } from "../dialogs/edit-deliverable-dialog";

type DeliverablesCardProp = {
  phase: PhaseDetail;
};

export default function DeliverablesCard({ phase }: DeliverablesCardProp) {
  const isTeamLead = useIsTeamLead();

  const deliverables = phase.deliverables || [];

  const {
    createDeliverableOpen,
    handleEditDeliverable,
    setCreateDeliverableOpen,
    handleCreateDeliverable,
    selectedDeliverable,
    editDeliverableOpen,
    setEditDeliverableOpen,
  } = usePhaseActions(phase.id);

  return (
    <>
      <Frame>
        <FrameHeader className="flex-row items-center justify-between p-4">
          <FrameTitle>Deliverables</FrameTitle>
          {isTeamLead ? (
            <Button
              onClick={handleCreateDeliverable}
              size="sm"
              variant="secondary"
            >
              <Plus className="size-4" />
              Add
            </Button>
          ) : null}
        </FrameHeader>
        <FramePanel className="space-y-2 p-2">
          <DeliverableItem
            deliverables={deliverables}
            isTeamLead={isTeamLead}
            onEdit={handleEditDeliverable}
          />
        </FramePanel>
      </Frame>
      {createDeliverableOpen ? (
        <DeliverableCreateDialog
          onOpenChange={setCreateDeliverableOpen}
          open={createDeliverableOpen}
          phaseId={phase.id}
        />
      ) : null}

      {selectedDeliverable ? (
        <DeliverableEditDialog
          deliverable={selectedDeliverable}
          onOpenChange={setEditDeliverableOpen}
          open={editDeliverableOpen}
        />
      ) : null}
    </>
  );
}
