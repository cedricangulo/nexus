import { cache } from "react";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { StatusBadge } from "@/components/ui/status";
import { getSprintTasks } from "@/lib/data/sprint";
import { getAllUsersForDisplay } from "@/lib/data/team";
import type { Task, TaskStatus, User } from "@/lib/types";
import { adviserTaskSearchParamsCache } from "@/lib/types/search-params";
import { AdviserTaskCard } from "./adviser-task-card";

type Props = {
  sprintId: string;
  token: string;
  searchParams: Record<string, string | string[] | undefined>;
};

type TaskColumn = {
  status: TaskStatus;
  label: string;
  tasks: Task[];
};

const COLUMNS: Array<{ status: TaskStatus; label: string }> = [
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "BLOCKED", label: "Blocked" },
  { status: "DONE", label: "Done" },
];

function filterAndSortTasks(
  tasks: Task[],
  _users: User[],
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

function groupTasksByStatus(tasks: Task[]): TaskColumn[] {
  const grouped = COLUMNS.map((col) => ({
    ...col,
    tasks: tasks.filter((task) => task.status === col.status),
  }));

  return grouped;
}

const getCachedTaskData = cache(
  async (
    sprintId: string,
    token: string,
    searchParams: Record<string, string | string[] | undefined>
  ) => {
    const [tasks, allUsers] = await Promise.all([
      getSprintTasks(sprintId, token),
      getAllUsersForDisplay(token),
    ]);

    // Filter out advisers (observers only, not task participants)
    const users = allUsers.filter((u) => u.role !== "ADVISER");

    const filters = adviserTaskSearchParamsCache.parse(searchParams);
    const filteredTasks = filterAndSortTasks(tasks, users, filters);
    const columns = groupTasksByStatus(filteredTasks);

    return { columns, users };
  }
);

export async function AdviserTaskBoard({
  sprintId,
  token,
  searchParams,
}: Props) {
  const { columns } = await getCachedTaskData(sprintId, token, searchParams);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {columns.map((column) => (
        <Frame className="h-fit" key={column.status} stackedPanels>
          <FrameHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={column.status} />
                <FrameTitle className="sr-only">{column.label}</FrameTitle>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-xs">
                {column.tasks.length}
              </span>
            </div>
          </FrameHeader>

          {column.tasks.length === 0 ? (
            <FramePanel className="flex min-h-30 items-center justify-center">
              <p className="text-muted-foreground text-sm">No tasks</p>
            </FramePanel>
          ) : (
            column.tasks.map((task) => (
              <AdviserTaskCard key={task.id} task={task} />
            ))
          )}
        </Frame>
      ))}
    </div>
  );
}
