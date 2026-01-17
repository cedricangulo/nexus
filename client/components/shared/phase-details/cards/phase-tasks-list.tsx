import Boundary from "@/components/internal/Boundary";
import { getPhaseTasksList } from "@/lib/data/phases";
import { getUsers } from "@/lib/data/users";
import { getAuthContext } from "@/lib/helpers/auth-token";
import PhaseTasksListClient from "./phase-tasks-list-client";

type Props = {
  phaseId: string;
};

export default async function PhaseTasksList({ phaseId }: Props) {
  const { token } = await getAuthContext();

  const [tasks, users] = await Promise.all([
    getPhaseTasksList(phaseId),
    getUsers(token),
  ]);

  // Filter out advisers - only members and team leads can be assigned to tasks
  const membersOnlyUsers = users.filter((u) => u.role !== "ADVISER");

  return (
    <Boundary hydration="client" rendering="static">
      <PhaseTasksListClient
        phaseId={phaseId}
        tasks={tasks}
        users={membersOnlyUsers}
      />
    </Boundary>
  );
}
