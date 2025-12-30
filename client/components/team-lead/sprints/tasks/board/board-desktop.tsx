"use client";

import { Badge } from "@/components/ui/badge";
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
import type { Task, TaskStatus, User } from "@/lib/types";

import { TaskCard } from "../task-card";

export type DesktopColumnDef = {
  status: TaskStatus;
  label: string;
  color: string;
};

export type TaskBoardDesktopProps = {
  columns: DesktopColumnDef[];
  columnsValue: Record<TaskStatus, Task[]>;
  userMap: Record<string, User>;
  isPending: boolean;
  onMove: (move: KanbanMoveEvent) => void;
  onValueChange: (value: Record<string, Task[]>) => void;
  onEditReason: (task: Task) => void;
  onTaskClick: (task: Task) => void;
};

export function TaskBoardDesktop({
  columns,
  columnsValue,
  isPending,
  onMove,
  onValueChange,
  onEditReason,
  onTaskClick,
}: TaskBoardDesktopProps) {
  return (
    <Kanban
      getItemValue={(item: Task) => item.id}
      onMove={onMove}
      onValueChange={onValueChange}
      value={columnsValue}
    >
      <UiKanbanBoard className="grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const columnTasks = columnsValue[col.status] ?? [];

          return (
            <KanbanColumn
              className="flex flex-col gap-3"
              key={col.status}
              value={col.status}
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <Badge className="text-xs" variant="secondary">
                  {columnTasks.length}
                </Badge>
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
                        <TaskCard
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
            <TaskCard
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
