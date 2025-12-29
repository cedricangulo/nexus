"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateTaskStatusAction } from "@/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MemberTaskCard } from "./member-task-card";
import { MemberTaskDetailDialog } from "./member-task-detail-dialog";

const COLUMN_DEFS = [
  {
    status: "TODO" as TaskStatus,
    label: "To Do",
    color: "bg-slate-50 dark:bg-slate-950",
  },
  {
    status: "IN_PROGRESS" as TaskStatus,
    label: "In Progress",
    color: "bg-blue-50 dark:bg-blue-950",
  },
  {
    status: "BLOCKED" as TaskStatus,
    label: "Blocked",
    color: "bg-red-50 dark:bg-red-950",
  },
  {
    status: "DONE" as TaskStatus,
    label: "Done",
    color: "bg-green-50 dark:bg-green-950",
  },
] as const;

type MemberKanbanBoardProps = {
  sprintId: string;
  tasks: Task[];
  currentUserId: string;
};

/**
 * Member-specific Kanban board with drag-and-drop
 * - Fully isolated from team-lead components (RBAC safe)
 * - Shows only member's own tasks
 * - Supports drag-and-drop between columns (desktop)
 * - Tab-based view on mobile
 * - Can mark tasks as blocked with mandatory reason
 */
export function MemberKanbanBoard({
  sprintId,
  tasks,
  currentUserId,
}: MemberKanbanBoardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockingTaskId, setBlockingTaskId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [activeTab, setActiveTab] = useState<TaskStatus>("TODO");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const isMobile = useIsMobile();

  // Organize tasks by status
  const columnValues = useMemo(() => {
    const organized: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      BLOCKED: [],
      DONE: [],
    };

    for (const task of tasks) {
      if (organized[task.status]) {
        organized[task.status].push(task);
      }
    }

    return organized;
  }, [tasks]);

  const handleKanbanMove = (event: KanbanMoveEvent) => {
    const sourceStatus = event.activeContainer as TaskStatus;
    const targetStatus = event.overContainer as TaskStatus;
    const taskIndex = event.activeIndex;

    const task = columnValues[sourceStatus]?.[taskIndex];
    if (!task) {
      return;
    }

    // RBAC: Verify user owns the task
    if (task.assigneeId !== currentUserId) {
      toast.error("You can only update your own tasks");
      return;
    }

    // If moving to BLOCKED, require reason
    if (targetStatus === "BLOCKED") {
      setBlockingTaskId(task.id);
      setShowBlockDialog(true);
      return;
    }

    // Update task status
    handleUpdateStatus(task.id, targetStatus, undefined);
  };

  const handleUpdateStatus = (
    taskId: string,
    newStatus: TaskStatus,
    blockComment?: string
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      return;
    }

    // RBAC: Verify user owns the task
    if (task.assigneeId !== currentUserId) {
      toast.error("You can only update your own tasks");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateTaskStatusAction({
          taskId,
          sprintId,
          status: newStatus,
          comment: blockComment || undefined,
        });

        if (result.success) {
          toast.success("Task updated");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update task");
        }
      } catch (_error) {
        toast.error("Failed to update task");
      }
    });
  };

  const handleConfirmBlock = () => {
    if (!(blockingTaskId && blockReason.trim())) {
      toast.error("Please provide a reason for blocking");
      return;
    }

    handleUpdateStatus(blockingTaskId, "BLOCKED", blockReason);
    setShowBlockDialog(false);
    setBlockingTaskId(null);
    setBlockReason("");
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
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

  // Desktop: Kanban drag-and-drop view
  if (!isMobile) {
    return (
      <>
        <Kanban
          getItemValue={(item: Task) => item.id}
          onMove={handleKanbanMove}
          onValueChange={() => {
            // Value change handled via onMove
          }}
          value={columnValues}
        >
          <UiKanbanBoard className="grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {COLUMN_DEFS.map((col) => {
              const columnTasks = columnValues[col.status] ?? [];

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
                    className={cn(
                      "flex-1 rounded-lg border-2 border-dashed p-3 transition-colors",
                      col.color,
                      isPending && "opacity-90"
                    )}
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
                              onTaskClick={handleTaskClick}
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
            {({ value }) => {
              const taskId = String(value);
              const task = Object.values(columnValues)
                .flat()
                .find((t) => t.id === taskId);

              if (!task) {
                return null;
              }

              return (
                <MemberTaskCard
                  interaction="drag"
                  onTaskClick={handleTaskClick}
                  task={task}
                />
              );
            }}
          </KanbanOverlay>
        </Kanban>

        <MemberTaskDetailDialog
          isOpen={showTaskDetail}
          onOpenChange={setShowTaskDetail}
          sprintId={sprintId}
          task={selectedTask}
        />

        {/* Block Reason Dialog */}
        {showBlockDialog ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
              <h2 className="mb-4 font-semibold text-lg">Block Task</h2>
              <p className="mb-4 text-muted-foreground text-sm">
                Please explain why this task is blocked
              </p>
              <textarea
                className="mb-4 w-full rounded-lg border border-border bg-background p-3 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g., Waiting for API endpoint from backend team..."
                rows={4}
                value={blockReason}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowBlockDialog(false);
                    setBlockReason("");
                    setBlockingTaskId(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  disabled={!blockReason.trim() || isPending}
                  onClick={handleConfirmBlock}
                >
                  {isPending ? "Blocking..." : "Block Task"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  // Mobile: Tab-based view
  return (
    <>
      <Tabs
        defaultValue={activeTab}
        onValueChange={(value) => setActiveTab(value as TaskStatus)}
      >
        <TabsList className="grid w-full grid-cols-4 gap-1">
          {COLUMN_DEFS.map((col) => {
            const count = (columnValues[col.status] ?? []).length;
            return (
              <TabsTrigger
                className="text-xs"
                key={col.status}
                value={col.status}
              >
                <span className="truncate">{col.label}</span>
                <Badge className="ml-1 text-xs" variant="secondary">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {COLUMN_DEFS.map((col) => {
          const columnTasks = columnValues[col.status] ?? [];

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
                    <div className="block w-full" key={task.id}>
                      <MemberTaskCard
                        interaction="tap"
                        onTaskClick={handleTaskClick}
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

      <MemberTaskDetailDialog
        isOpen={showTaskDetail}
        onOpenChange={setShowTaskDetail}
        sprintId={sprintId}
        task={selectedTask}
      />

      {/* Block Reason Dialog */}
      {showBlockDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="mb-4 font-semibold text-lg">Block Task</h2>
            <p className="mb-4 text-muted-foreground text-sm">
              Please explain why this task is blocked
            </p>
            <Textarea
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder=""
              rows={3}
              value={blockReason}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowBlockDialog(false);
                  setBlockReason("");
                  setBlockingTaskId(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={!blockReason.trim() || isPending}
                onClick={handleConfirmBlock}
              >
                {isPending ? "Blocking..." : "Block Task"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
