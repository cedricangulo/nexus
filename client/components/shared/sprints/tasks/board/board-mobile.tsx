"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Task, TaskStatus, User } from "@/lib/types";
import { TaskCard } from "../task-card";

export interface MobileColumnDef {
  status: TaskStatus;
  label: string;
}

export interface TaskBoardMobileProps {
  columns: MobileColumnDef[];
  columnsValue: Record<TaskStatus, Task[]>;
  userMap: Record<string, User>;
  isPending: boolean;
  onStatusChange: (task: Task, toStatus: TaskStatus) => void;
  onEditReason: (task: Task) => void;
  onTaskClick: (task: Task) => void;
}

export function TaskBoardMobile({
  columns,
  columnsValue,
  onEditReason,
  onTaskClick,
}: TaskBoardMobileProps) {
  const [activeTab, setActiveTab] = useState<TaskStatus>("TODO");

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={(value) => setActiveTab(value as TaskStatus)}
    >
      <TabsList className="flex w-full gap-1 overflow-x-scroll pl-2">
        {columns.map((col) => {
          const count = (columnsValue[col.status] ?? []).length;
          return (
            <TabsTrigger
              className="flex items-center text-xs"
              key={col.status}
              value={col.status}
            >
              <span>{count}</span>
              <StatusBadge status={col.status} />
            </TabsTrigger>
          );
        })}
      </TabsList>

      {columns.map((col) => {
        const columnTasks = columnsValue[col.status] ?? [];

        return (
          <TabsContent
            className="mt-4 space-y-2"
            key={col.status}
            value={col.status}
          >
            {columnTasks.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground text-sm">
                No tasks in {col.label}
              </p>
            ) : (
              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <div
                    aria-label={`Open ${task.title}`}
                    className="block w-full"
                    key={task.id}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <TaskCard
                      interaction="tap"
                      onBlockClick={onEditReason}
                      onTaskClick={onTaskClick}
                      task={task}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
