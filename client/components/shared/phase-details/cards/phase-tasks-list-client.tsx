"use client";

import { Trash } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { TaskCard } from "@/components/shared/phase-details/task-card";
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
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { usePhaseActions } from "@/hooks/use-phase-actions";
import type { Task, User } from "@/lib/types";
import {
  useAuthContext,
  useIsAdviser,
  useIsTeamLead,
} from "@/providers/auth-context-provider";
import { AdviserTaskDialog } from "../../phases/dialogs/adviser-task-dialog";
import { EditTaskDialog } from "../../phases/dialogs/edit-task-dialog";
import AddTaskButton from "../card-actions/add-task";

const STATUS_ORDER = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as const;

type Props = {
  phaseId: string;
  tasks: Task[];
  users: User[];
};

export default function PhaseTasksList({ phaseId, tasks, users }: Props) {
  const isTeamLead = useIsTeamLead();
  const isAdviser = useIsAdviser();
  const { user } = useAuthContext();

  const {
    selectedTask,
    editTaskDialogOpen,
    setEditTaskDialogOpen,
    viewTaskDialogOpen,
    setViewTaskDialogOpen,
    handleEditTask,
    handleViewTask,
    confirmDeleteTask,
  } = usePhaseActions(phaseId);

  // Filter users to only members (exclude advisers) for assignment lists
  const membersOnlyUsers = useMemo(
    () => users.filter((u) => u.role !== "ADVISER"),
    [users]
  );

  // Local state for alert dialog
  const [pendingDeleteTask, setPendingDeleteTask] = useState<Task | null>(null);

  // Memoize sorted tasks to avoid re-sorting on every render
  const sortedTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
      ),
    [tasks]
  );

  // Stable callbacks for handlers passed to children
  const onRequestDelete = useCallback((t: Task) => {
    setPendingDeleteTask(t);
  }, []);

  const onEdit = useCallback(
    (t: Task) => {
      handleEditTask(t);
    },
    [handleEditTask]
  );

  const onView = useCallback(
    (t: Task) => {
      handleViewTask(t);
    },
    [handleViewTask]
  );

  // Compute derived values once
  const showAddTaskButton = useMemo(
    () => isTeamLead || !isAdviser,
    [isTeamLead, isAdviser]
  );
  const userRole = useMemo(
    () => (isTeamLead ? "teamLead" : "member"),
    [isTeamLead]
  );

  const EditDialog = useMemo(() => {
    if (!selectedTask || isAdviser) {
      return null;
    }

    return (
      <EditTaskDialog
        dialogControl={{
          open: editTaskDialogOpen,
          onOpenChange: setEditTaskDialogOpen,
        }}
        phaseId={phaseId}
        task={selectedTask}
        userRole={userRole}
        users={users}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedTask,
    isAdviser,
    userRole,
    editTaskDialogOpen,
    users,
    phaseId,
    setEditTaskDialogOpen,
  ]);

  const ViewDialog = useMemo(() => {
    if (!selectedTask) {
      return null;
    }

    // Only render adviser/view dialog when appropriate
    if (!(isAdviser || viewTaskDialogOpen)) {
      return null;
    }

    return (
      <AdviserTaskDialog
        onOpenChange={setViewTaskDialogOpen}
        open={viewTaskDialogOpen}
        task={selectedTask}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTask, isAdviser, viewTaskDialogOpen, setViewTaskDialogOpen]);

  const DeleteDialog = useMemo(() => {
    if (!pendingDeleteTask) {
      return null;
    }

    return (
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteTask(null);
          }
        }}
        open={Boolean(pendingDeleteTask)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{pendingDeleteTask.title}"? This
              action can be cancelled during the countdown.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDeleteTask) {
                  confirmDeleteTask(
                    pendingDeleteTask.id,
                    pendingDeleteTask.title
                  );
                }
                setPendingDeleteTask(null);
              }}
              variant="destructive"
            >
              <Trash />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }, [pendingDeleteTask, confirmDeleteTask]);

  return (
    <>
      <Frame stackedPanels>
        <FrameHeader className="p-4">
          <div className="flex items-center justify-between gap-2">
            <FrameTitle>Tasks</FrameTitle>
            {showAddTaskButton && (
              <AddTaskButton phaseId={phaseId} users={membersOnlyUsers} />
            )}
          </div>
        </FrameHeader>

        {sortedTasks.length === 0 ? (
          <FramePanel>
            <p className="py-4 text-center text-muted-foreground text-sm">
              No tasks yet
            </p>
          </FramePanel>
        ) : (
          sortedTasks.map((task) => {
            const isAssigned = task.assignees?.some((a) => a.id === user.id);

            return (
              <TaskCard
                key={task.id}
                onDelete={isTeamLead ? onRequestDelete : undefined}
                onEdit={isTeamLead || isAssigned ? onEdit : undefined}
                onViewDetails={
                  isAdviser || !(isTeamLead || isAssigned) ? onView : undefined
                }
                task={task}
              />
            );
          })
        )}
      </Frame>

      {EditDialog}
      {ViewDialog}
      {DeleteDialog}
    </>
  );
}
