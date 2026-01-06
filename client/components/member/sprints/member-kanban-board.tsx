"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { updateTaskStatusAction } from "@/actions/tasks";
import type { KanbanMoveEvent } from "@/components/ui/kanban";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Task, TaskStatus } from "@/lib/types";
import { MemberTaskBoardDesktop } from "./board-desktop";
import { MemberTaskBoardMobile } from "./board-mobile";
import { MemberTaskBlockDialog } from "./member-task-block-dialog";
import { MemberTaskDetailDialog } from "./member-task-detail-dialog";

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

type MemberKanbanBoardProps = {
  sprintId: string;
  tasks: Task[];
  currentUserId: string;
};

/**
 * Member-specific Kanban board matching team-lead structure
 * - Supports drag-and-drop on desktop
 * - Tab-based view on mobile
 * - Members can update task status and mark as blocked
 * - Read-only task details (no editing permissions)
 */
export function MemberKanbanBoard({
  sprintId,
  tasks,
  currentUserId,
}: MemberKanbanBoardProps) {
  const isMobile = useIsMobile();
  const [blockingTask, setBlockingTask] = useState<Task | null>(null);
  const [blockingFromStatus, setBlockingFromStatus] =
    useState<TaskStatus | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(
    null
  );
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
        router.refresh();
      } else {
        setColumnsValue(previous);
      }
    });
  };

  const handleMove = (event: KanbanMoveEvent) => {
    const sourceStatus = event.activeContainer as TaskStatus;
    const targetStatus = event.overContainer as TaskStatus;

    const previous = columnsValue;
    const fromIndex = (previous[sourceStatus] ?? []).findIndex(
      (t) => t.id === event.event.active.id
    );
    const task = previous[sourceStatus]?.[fromIndex];

    if (!task) {
      return;
    }

    handleStatusChange(task, targetStatus);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setSelectedTaskDetail(task);
  };

  const handleEditReason = (task: Task) => {
    setBlockingTask(task);
    setBlockingFromStatus(task.status);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border border-dashed py-12 text-center">
        <p className="text-muted-foreground text-sm">
          No tasks assigned to you in this sprint.
        </p>
      </div>
    );
  }

  return (
    <>
      <div>
        {isMobile ? (
          <MemberTaskBoardMobile
            columnsValue={columnsValue}
            isPending={isPending}
            onEditReason={handleEditReason}
            onTaskClick={handleTaskClick}
          />
        ) : (
          <MemberTaskBoardDesktop
            columnsValue={columnsValue}
            isPending={isPending}
            onEditReason={handleEditReason}
            onMove={handleMove}
            onTaskClick={handleTaskClick}
          />
        )}
      </div>

      <MemberTaskBlockDialog
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
        taskId={blockingTask?.id ?? null}
      />

      {selectedTask && selectedTaskDetail ? (
        <MemberTaskDetailDialog
          isOpen={Boolean(selectedTask)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedTask(null);
              setSelectedTaskDetail(null);
            }
          }}
          sprintId={sprintId}
          task={selectedTaskDetail}
        />
      ) : null}
    </>
  );
}
