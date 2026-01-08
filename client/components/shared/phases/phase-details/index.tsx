"use client";

import type { PhaseDetail, User } from "@/lib/types";
import DeliverablesCard from "./deliverables-card";
import MeetingsCard from "./meetings-card";
import TasksCard from "./tasks-card";

type PhaseDetailContentProps = {
  phase: PhaseDetail;
  users: User[];
  taskDialogSlot?: React.ReactNode;
};

export function PhaseDetailContent({
  phase,
  users,
  taskDialogSlot,
}: PhaseDetailContentProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Column 1: Waterfall Tasks */}
      <TasksCard phase={phase} slot={taskDialogSlot} users={users} />

      {/* Column 2: Deliverables */}
      <DeliverablesCard phase={phase} />

      {/* Column 3: Meeting Minutes */}
      <MeetingsCard phase={phase} />
    </div>
  );
}
