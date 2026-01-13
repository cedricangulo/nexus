"use client";

import { Plus } from "lucide-react";
import { CreateTaskDialog } from "@/components/shared/phases/dialogs/create-task-dialog";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";
import { useIsTeamLead } from "@/providers/auth-context-provider";
import Boundary from "@/components/internal/Boundary";

type Props = {
  phaseId: string;
  users: User[];
};

export default function AddTaskButton({ phaseId, users }: Props) {

  const isTeamLead = useIsTeamLead();

  // Only TEAM_LEAD and MEMBER can create tasks
  if (!isTeamLead) {
    return null;
  }

  return (
    <Boundary hydration="client">
      <CreateTaskDialog
        phaseId={phaseId}
        trigger={
          <Button size="sm" variant="secondary">
            <Plus />
            Add
          </Button>
        }
        users={users}
      />
    </Boundary>
  );
}