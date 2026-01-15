"use client";

import { useIsTeamLead } from "@/providers/auth-context-provider";

export default function KanbanBoardUI({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const isTeamLead = useIsTeamLead();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {isTeamLead && action ? (
          <>
            <h2 className="font-semibold text-lg">Task Board</h2>
            {action}
          </>
        ) : null}
      </div>
      {children}
    </div>
  );
}
