"use client";

import { Edit } from "lucide-react";
import { useState } from "react";
import { PhaseEditDialog } from "@/components/shared/phases/dialogs/edit-phase-dialog";
import { Button } from "@/components/ui/button";
import type { Phase } from "@/lib/types";
import { useIsTeamLead } from "@/providers/auth-context-provider";

type Props = {
  phase: Phase;
};

export function PhaseEditButton({ phase }: Props) {
  const isTeamLead = useIsTeamLead();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className={isTeamLead ? "" : "hidden"}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        size="icon"
        title="Edit Phase"
        variant="ghost"
      >
        <Edit />
      </Button>

      {!isOpen ? null : (
        <PhaseEditDialog onOpenChange={setIsOpen} open={isOpen} phase={phase} />
      )}
    </>
  );
}
