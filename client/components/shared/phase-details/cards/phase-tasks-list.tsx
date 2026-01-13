import { TaskCard } from "@/components/shared/phase-details/task-card";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame";
import { getPhaseTasksList } from "@/lib/data/phases";
import { getUsers } from "@/lib/data/users";
import { getAuthContext } from "@/lib/helpers/auth-token";
import type { Task, User } from "@/lib/types";
import AddTaskButton from "../card-actions/add-task";
import Boundary from "@/components/internal/Boundary";

type Props = {
	phaseId: string;
};

export default async function PhaseTasksList({ phaseId }: Props) {
  const { token } = await getAuthContext();

  const [tasks, users] = await Promise.all([
    getPhaseTasksList(phaseId),
    getUsers(token),
  ]);

  return <TasksListUI phaseId={phaseId} tasks={tasks} users={users} />;
}

type TasksListUIProps = {
  phaseId: string;
  tasks: Task[];
  users: User[];
};

async function TasksListUI({ phaseId, tasks, users }: TasksListUIProps) {
  "use cache";

  const statusOrder = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
  const sortedTasks = [...tasks].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  );

  return (
    <Boundary rendering="static" hydration="server" cached>
      <Frame stackedPanels>
        <FrameHeader className="p-4">
          <div className="flex items-center justify-between gap-2">
            <FrameTitle>Tasks</FrameTitle>
            <AddTaskButton phaseId={phaseId} users={users} />
          </div>
        </FrameHeader>
        {sortedTasks.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground text-sm">
            No tasks yet
          </p>
        ) : (
          sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
            />
          ))
        )}
      </Frame>
    </Boundary>
  );
}
