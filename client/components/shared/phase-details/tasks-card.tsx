"use client";

import { Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { usePhaseActions } from "@/hooks/use-phase-actions";
import type { PhaseDetail, User } from "@/lib/types";
import { useIsTeamLead } from "@/providers/auth-context-provider";
import { EditTaskDialog } from "../phases/dialogs/edit-task-dialog";
import { TaskCard } from "./task-card";

type TasksCardProp = {
  phase: PhaseDetail;
  slot: React.ReactNode;
  users: User[];
};

export default function TasksCard({ phase, slot, users }: TasksCardProp) {
  const isTeamLead = useIsTeamLead();

  const tasks = phase.tasks || [];

  const {
    selectedTask,
    setDeleteTaskId,
    confirmDeleteTask,
    deleteTaskId,
    isDeleting,
    handleEditTask,
    handleDeleteTask,
    editTaskDialogOpen,
    setEditTaskDialogOpen,
  } = usePhaseActions(phase.id);

  // Sort tasks by status: TODO first, then IN_PROGRESS, BLOCKED, DONE
  const statusOrder = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
  const sortedTasks = [...tasks].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  );
  return (
    <>
      <Frame>
        <FrameHeader className="flex-row items-center justify-between p-4">
          <FrameTitle>Tasks</FrameTitle>
          {isTeamLead ? slot : null}
        </FrameHeader>
        <FramePanel className="space-y-2 p-2">
          {sortedTasks.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground text-sm">
              No tasks yet
            </p>
          ) : (
            sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
                task={task}
              />
            ))
          )}
        </FramePanel>
      </Frame>

      {selectedTask ? (
        <EditTaskDialog
          dialogControl={{
            open: editTaskDialogOpen,
            onOpenChange: setEditTaskDialogOpen,
          }}
          phaseId={phase.id}
          task={selectedTask}
          userRole={isTeamLead ? "teamLead" : "member"}
          users={users}
        />
      ) : null}

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTaskId(null);
          }
        }}
        open={deleteTaskId !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteTaskId === null || isDeleting !== null}
              onClick={() => {
                if (!deleteTaskId) {
                  return;
                }
                const task = tasks.find((t) => t.id === deleteTaskId);
                const taskTitle = task?.title || "Task";
                setDeleteTaskId(null);
                confirmDeleteTask(deleteTaskId, taskTitle);
              }}
              variant="destructive"
            >
              <Trash />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
