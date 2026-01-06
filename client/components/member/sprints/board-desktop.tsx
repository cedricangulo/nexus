"use client";

import {
  Kanban,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  type KanbanMoveEvent,
  KanbanOverlay,
  KanbanBoard as UiKanbanBoard,
} from "@/components/ui/kanban";
import { StatusBadge } from "@/components/ui/status";
import type { Task, TaskStatus } from "@/lib/types";
import { MemberTaskCard } from "./member-task-card";

const COLUMN_DEFS: Array<{
  status: TaskStatus;
  label: string;
  color: string;
}> = [
  {
    status: "TODO",
    label: "To Do",
    color: "bg-accent/50",
  },
  {
    status: "IN_PROGRESS",
    label: "In Progress",
    color: "bg-info",
  },
  {
    status: "BLOCKED",
    label: "Blocked",
    color: "bg-error",
  },
  {
    status: "DONE",
    label: "Done",
    color: "bg-success",
  },
] as const;

export type MemberTaskBoardDesktopProps = {
  columnsValue: Record<TaskStatus, Task[]>;
  isPending: boolean;
  onMove: (move: KanbanMoveEvent) => void;
  onEditReason: (task: Task) => void;
  onTaskClick: (task: Task) => void;
};

export function MemberTaskBoardDesktop({
  columnsValue,
  isPending,
  onMove,
  onEditReason,
  onTaskClick,
}: MemberTaskBoardDesktopProps) {
  return (
    <Kanban
      getItemValue={(item: Task) => item.id}
      onMove={onMove}
      onValueChange={() => {
        // Value change handled via onMove
      }}
      value={columnsValue}
    >
      <UiKanbanBoard className="grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {COLUMN_DEFS.map((col) => {
          const columnTasks = columnsValue[col.status] ?? [];

          return (
            <KanbanColumn
              className="flex flex-col gap-3"
              key={col.status}
              value={col.status}
            >
              <div className="flex items-center gap-2">
                <span className="font-sora text-sm">{columnTasks.length}</span>
                <StatusBadge status={col.status} />
              </div>

              <KanbanColumnContent
                className={`flex-1 rounded-lg border-2 border-dashed p-3 transition-colors ${col.color} ${isPending ? "opacity-90" : ""}`}
                value={col.status}
              >
                {columnTasks.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground text-xs">
                    No tasks
                  </p>
                ) : (
                  columnTasks.map((task) => (
                    <KanbanItem
                      className="rounded-lg bg-card"
                      key={task.id}
                      value={task.id}
                    >
                      <KanbanItemHandle className="w-full">
                        <MemberTaskCard
                          interaction="drag"
                          onBlockClick={onEditReason}
                          onTaskClick={onTaskClick}
                          task={task}
                        />
                      </KanbanItemHandle>
                    </KanbanItem>
                  ))
                )}
              </KanbanColumnContent>
            </KanbanColumn>
          );
        })}
      </UiKanbanBoard>

      <KanbanOverlay>
        {({ value, variant }) => {
          if (variant === "column") {
            return null;
          }

          const taskId = String(value);
          const task = Object.values(columnsValue)
            .flat()
            .find((t) => t.id === taskId);

          if (!task) {
            return null;
          }

          return (
            <MemberTaskCard
              interaction="drag"
              onBlockClick={onEditReason}
              onTaskClick={onTaskClick}
              task={task}
            />
          );
        }}
      </KanbanOverlay>
    </Kanban>
  );
}
