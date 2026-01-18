import { CreateTaskDialog } from "@/components/shared/sprints/sprint-details/create-task-dialog";
import { KanbanBoard } from "@/components/shared/sprints/tasks/board/kanban-board";
import { getSprintTasks } from "@/lib/data/sprint";
import { getAllUsersForDisplay } from "@/lib/data/team";
import type { Task } from "@/lib/types";
import { adviserTaskSearchParamsCache } from "@/lib/types/search-params";

type Props = {
  sprintId: string;
  token: string;
  searchParams?: Record<string, string | string[] | undefined>;
};

function filterAndSortTasks(
  tasks: Task[],
  filters: {
    assignee: string;
    sortBy: string;
    sortOrder: string;
  }
): Task[] {
  let filtered = [...tasks];

  // Filter by assignee
  if (filters.assignee !== "ALL") {
    if (filters.assignee === "UNASSIGNED") {
      filtered = filtered.filter(
        (task) => !task.assignees || task.assignees.length === 0
      );
    } else {
      filtered = filtered.filter((task) =>
        task.assignees?.some((a) => a.id === filters.assignee)
      );
    }
  }

  // Sort tasks
  filtered.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "assigneeCount":
        comparison = (a.assignees?.length || 0) - (b.assignees?.length || 0);
        break;
      default:
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return filters.sortOrder === "asc" ? comparison : -comparison;
  });

  return filtered;
}

export async function KanbanBoardServer({
  sprintId,
  token,
  searchParams = {},
}: Props) {
  const [tasks, allUsers] = await Promise.all([
    getSprintTasks(sprintId, token),
    getAllUsersForDisplay(token),
  ]);

  // Filter out advisers (observers only, not task participants)
  const users = allUsers.filter((u) => u.role !== "ADVISER");

  // Parse and apply filters
  const filters = adviserTaskSearchParamsCache.parse(searchParams);
  const filteredTasks = filterAndSortTasks(tasks, filters);

  return (
    <KanbanBoard sprintId={sprintId} tasks={filteredTasks} users={users} />
  );
}

export async function CreateTaskAction({ sprintId, token }: Props) {
  const allUsers = await getAllUsersForDisplay(token);

  // Filter out advisers (observers only, not task participants)
  const users = allUsers.filter((u) => u.role !== "ADVISER");

  return <CreateTaskDialog sprintId={sprintId} users={users} />;
}
