"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { getTaskDetailAction, updateTaskStatusAction } from "@/actions/tasks";
import type { KanbanMoveEvent } from "@/components/ui/kanban";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Task, TaskStatus, User } from "@/lib/types";
import { TaskBlockDialog } from "../task-block-dialog";
import { TaskDetailDialog } from "../task-details";
import { TaskBoardDesktop } from "./board-desktop";
import { TaskBoardMobile } from "./board-mobile";

type TaskColumns = Record<TaskStatus, Task[]>;

function buildTaskColumns(tasks: Task[]): TaskColumns {
  return {
    TODO: tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    BLOCKED: tasks.filter((t) => t.status === "BLOCKED"),
    DONE: tasks.filter((t) => t.status === "DONE"),
  };
}

function moveBetweenColumns<T>(params: {
  columns: Record<string, T[]>;
  fromColumn: string;
  toColumn: string;
  fromIndex: number;
  toIndex: number;
}): Record<string, T[]> {
  const { columns, fromColumn, toColumn, fromIndex, toIndex } = params;
  const fromItems = [...(columns[fromColumn] ?? [])];
  const toItems = [...(columns[toColumn] ?? [])];

  if (fromIndex < 0 || fromIndex >= fromItems.length) {
    return columns;
  }

  const [moved] = fromItems.splice(fromIndex, 1);
  const insertIndex = Math.min(Math.max(toIndex, 0), toItems.length);
  toItems.splice(insertIndex, 0, moved);

  return {
    ...columns,
    [fromColumn]: fromItems,
    [toColumn]: toItems,
  };
}

type KanbanBoardProps = {
  tasks: Task[];
  users: User[];
  sprintId: string;
};

export function KanbanBoard({ tasks, users, sprintId }: KanbanBoardProps) {
  // TODO: Add filter and sort controls required by sprint board stories.
  const isMobile = useIsMobile();
  const [blockingTask, setBlockingTask] = useState<Task | null>(null);
  const [blockingFromStatus, setBlockingFromStatus] =
    useState<TaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(
    null
  );
  const [_isLoadingTaskDetail, setIsLoadingTaskDetail] = useState(false);
  const [columnsValue, setColumnsValue] = useState<TaskColumns>(() =>
    buildTaskColumns(tasks)
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const lastCommittedColumnsRef = useRef<TaskColumns>(columnsValue);

  useEffect(() => {
    const next = buildTaskColumns(tasks);
    setColumnsValue(next);
    lastCommittedColumnsRef.current = next;
  }, [tasks]);

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const columns: Array<{
    status: TaskStatus;
    label: string;
    color: string;
  }> = [
    {
      status: "TODO",
      label: "To Do",
      color: "bg-neutral-50 dark:bg-neutral-900",
    },
    {
      status: "IN_PROGRESS",
      label: "In Progress",
      color: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      status: "BLOCKED",
      label: "Blocked",
      color: "bg-red-50 dark:bg-red-950/30",
    },
    {
      status: "DONE",
      label: "Done",
      color: "bg-green-50 dark:bg-green-950/30",
    },
  ];

  const handleStatusChange = (task: Task, toStatus: TaskStatus) => {
    const fromStatus = task.status;
    if (fromStatus === toStatus) {
      return;
    }

    if (toStatus === "BLOCKED") {
      setBlockingTask(task);
      setBlockingFromStatus(fromStatus);
      return;
    }

    const previous = columnsValue;
    const fromIndex = (previous[fromStatus] ?? []).findIndex(
      (t) => t.id === task.id
    );
    const next = moveBetweenColumns({
      columns: previous,
      fromColumn: fromStatus,
      toColumn: toStatus,
      fromIndex,
      toIndex: (previous[toStatus] ?? []).length,
    }) as TaskColumns;

    setColumnsValue(next);

    startTransition(async () => {
      const result = await updateTaskStatusAction({
        sprintId,
        taskId: task.id,
        status: toStatus,
        comment: "",
      });

      if (result.success) {
        lastCommittedColumnsRef.current = next;
        toast.success("Task updated");
        router.refresh();
      } else {
        setColumnsValue(previous);
        toast.error(result.error || "Failed to update task");
      }
    });
  };

  const handleMove = (move: KanbanMoveEvent) => {
    const fromStatus = move.activeContainer as TaskStatus;
    const toStatus = move.overContainer as TaskStatus;

    if (fromStatus === toStatus) {
      return;
    }

    const task = (columnsValue[fromStatus] ?? [])[move.activeIndex];
    if (!task) {
      return;
    }

    if (toStatus === "BLOCKED") {
      setBlockingTask(task);
      setBlockingFromStatus(fromStatus);
      return;
    }

    const previous = columnsValue;
    const next = moveBetweenColumns({
      columns: previous,
      fromColumn: fromStatus,
      toColumn: toStatus,
      fromIndex: move.activeIndex,
      toIndex: move.overIndex,
    }) as TaskColumns;

    setColumnsValue(next);

    startTransition(async () => {
      const result = await updateTaskStatusAction({
        sprintId,
        taskId: task.id,
        status: toStatus,
        comment: "",
      });

      if (result.success) {
        lastCommittedColumnsRef.current = next;
        toast.success("Task updated");
        router.refresh();
      } else {
        setColumnsValue(previous);
        toast.error(result.error || "Failed to update task");
      }
    });
  };

  const handleValueChange = (value: Record<string, Task[]>) => {
    // Don't update if we're in the middle of a blocking dialog
    if (blockingTask) {
      return;
    }
    setColumnsValue(value as TaskColumns);
  };

  const handleEditReason = (task: Task) => {
    setBlockingTask(task);
    setBlockingFromStatus(task.status);
  };

  const handleTaskClick = async (task: Task) => {
    setSelectedTask(task);
    setIsLoadingTaskDetail(true);
    try {
      const detailedTask = await getTaskDetailAction(task.id);

      setSelectedTaskDetail(detailedTask);
    } catch (error) {
      console.error("Failed to fetch task details:", error);
      setSelectedTaskDetail(task);
    } finally {
      setIsLoadingTaskDetail(false);
    }
  };

  return (
    <>
      <div suppressHydrationWarning>
        {isMobile ? (
          <TaskBoardMobile
            columns={columns.map(({ status, label }) => ({ status, label }))}
            columnsValue={columnsValue}
            isPending={isPending}
            onEditReason={handleEditReason}
            onStatusChange={handleStatusChange}
            onTaskClick={handleTaskClick}
            userMap={userMap}
          />
        ) : (
          <TaskBoardDesktop
            columns={columns}
            columnsValue={columnsValue}
            isPending={isPending}
            onEditReason={handleEditReason}
            onMove={handleMove}
            onTaskClick={handleTaskClick}
            onValueChange={handleValueChange}
            userMap={userMap}
          />
        )}
      </div>

      <TaskBlockDialog
        onOpenChange={(open) => {
          if (!open) {
            setBlockingTask(null);
            setBlockingFromStatus(null);
          }
        }}
        onSuccess={() => {
          if (!(blockingTask && blockingFromStatus)) {
            return;
          }

          if (blockingFromStatus === "BLOCKED") {
            setBlockingFromStatus(null);
            router.refresh();
            return;
          }

          const previous = lastCommittedColumnsRef.current;
          const fromItems = previous[blockingFromStatus] ?? [];
          const fromIndex = fromItems.findIndex(
            (t) => t.id === blockingTask.id
          );

          if (fromIndex === -1) {
            return;
          }

          const next = moveBetweenColumns({
            columns: previous,
            fromColumn: blockingFromStatus,
            toColumn: "BLOCKED",
            fromIndex,
            toIndex: (previous.BLOCKED ?? []).length,
          }) as TaskColumns;

          setColumnsValue(next);
          lastCommittedColumnsRef.current = next;
          setBlockingFromStatus(null);
          router.refresh();
        }}
        open={Boolean(blockingTask)}
        sprintId={sprintId}
        targetStatus="BLOCKED"
        taskId={blockingTask?.id ?? null}
      />

      {selectedTask && selectedTaskDetail ? (
        <TaskDetailDialog
          onOpenChange={(open) => {
            if (!open) {
              setSelectedTask(null);
              setSelectedTaskDetail(null);
            }
          }}
          open={Boolean(selectedTask)}
          sprintId={sprintId}
          task={{
            ...selectedTaskDetail,
            assignee: selectedTaskDetail.assigneeId
              ? users.find((u) => u.id === selectedTaskDetail.assigneeId)
              : null,
          }}
          teamMembers={users}
        />
      ) : null}
    </>
  );
}
