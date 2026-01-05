"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Task, TaskStatus } from "@/lib/types";
import { MemberTaskCard } from "./member-task-card";

const COLUMN_DEFS = [
  {
    status: "TODO" as TaskStatus,
    label: "To Do",
  },
  {
    status: "IN_PROGRESS" as TaskStatus,
    label: "In Progress",
  },
  {
    status: "BLOCKED" as TaskStatus,
    label: "Blocked",
  },
  {
    status: "DONE" as TaskStatus,
    label: "Done",
  },
] as const;

export type MemberTaskBoardMobileProps = {
  columnsValue: Record<TaskStatus, Task[]>;
  isPending: boolean;
  onEditReason: (task: Task) => void;
  onTaskClick: (task: Task) => void;
};

export function MemberTaskBoardMobile({
  columnsValue,
  onEditReason,
  onTaskClick,
}: MemberTaskBoardMobileProps) {
  const [activeTab, setActiveTab] = useState<TaskStatus>("TODO");

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={(value) => setActiveTab(value as TaskStatus)}
    >
      <TabsList className="flex w-full gap-1 overflow-x-scroll pl-10">
        {COLUMN_DEFS.map((col) => {
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

      {COLUMN_DEFS.map((col) => {
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
                    <MemberTaskCard
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
