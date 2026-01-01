"use client";

import { FileText, Plus, Upload } from "lucide-react";
import Link from "next/link";

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
import { formatDate } from "@/lib/helpers/format-date";
import type { MeetingLog, PhaseDetail, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DeliverableItem } from "./cards/deliverable-item";
import { TaskCard } from "./cards/task-card";
import { DeliverableCreateDialog } from "./dialogs/deliverable-create-dialog";
import { DeliverableEditDialog } from "./dialogs/deliverable-edit-dialog";
import { CreateTaskButton, TaskDialog } from "./dialogs/task-dialog";
import { UploadPhaseMinutesDialog } from "./dialogs/upload-phase-minutes-dialog";
import { usePhaseActions } from "./use-phase-actions";

type PhaseDetailContentProps = {
  phase: PhaseDetail;
  users: User[];
  isTeamLead?: boolean;
};

export function PhaseDetailContent({
  phase,
  users,
  isTeamLead = false,
}: PhaseDetailContentProps) {
  const tasks = phase.tasks || [];
  const deliverables = phase.deliverables || [];
  const meetingLogs = phase.meetingLogs || [];

  const {
    selectedTask,
    editTaskDialogOpen,
    setEditTaskDialogOpen,
    deleteTaskId,
    setDeleteTaskId,
    handleEditTask,
    handleDeleteTask,
    confirmDeleteTask,
    selectedDeliverable,
    createDeliverableOpen,
    setCreateDeliverableOpen,
    editDeliverableOpen,
    setEditDeliverableOpen,
    handleEditDeliverable,
    handleCreateDeliverable,
    meetingUploadOpen,
    setMeetingUploadOpen,
    isDeleting,
  } = usePhaseActions(phase.id);

  // Sort tasks by status: TODO first, then IN_PROGRESS, BLOCKED, DONE
  const statusOrder = { TODO: 0, IN_PROGRESS: 1, BLOCKED: 2, DONE: 3 };
  const sortedTasks = [...tasks].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Column 1: Waterfall Tasks */}
        <Frame>
          <FrameHeader className="flex-row items-center justify-between p-4">
            <FrameTitle>Waterfall Tasks</FrameTitle>
            {isTeamLead ? (
              <CreateTaskButton phaseId={phase.id} users={users} />
            ) : null}
          </FrameHeader>
          <FramePanel className="space-y-2 p-2">
            {sortedTasks.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No tasks yet
              </p>
            ) : (
              sortedTasks.map((task) => (
                <TaskCard
                  isTeamLead={isTeamLead}
                  key={task.id}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                  task={task}
                />
              ))
            )}
          </FramePanel>
        </Frame>

        {/* Column 2: Deliverables */}
        <Frame>
          <FrameHeader className="flex-row items-center justify-between p-4">
            <FrameTitle>Deliverables</FrameTitle>
            {isTeamLead ? (
              <Button
                onClick={handleCreateDeliverable}
                size="sm"
                variant="outline"
              >
                <Plus className="size-4" />
                Add
              </Button>
            ) : null}
          </FrameHeader>
          <FramePanel className="space-y-2 p-2">
            <DeliverableItem
              deliverables={deliverables}
              isTeamLead={isTeamLead}
              onEdit={handleEditDeliverable}
            />
          </FramePanel>
        </Frame>

        {/* Column 3: Meeting Minutes */}
        <Frame>
          <FrameHeader className="flex-row items-center justify-between p-4">
            <FrameTitle>Meeting Minutes</FrameTitle>
            <Button
              onClick={() => setMeetingUploadOpen(true)}
              size="sm"
              variant="outline"
            >
              <Upload size={16} />
              Upload
            </Button>
          </FrameHeader>
          <FramePanel className="space-y-2 p-2">
            {meetingLogs.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground text-sm">
                No meeting logs yet
              </p>
            ) : (
              meetingLogs.map((log) => (
                <MeetingLogCard key={log.id} log={log} />
              ))
            )}
          </FramePanel>
        </Frame>
      </div>

      {createDeliverableOpen ? (
        <DeliverableCreateDialog
          onOpenChange={setCreateDeliverableOpen}
          open={createDeliverableOpen}
          phaseId={phase.id}
        />
      ) : null}

      {selectedDeliverable ? (
        <DeliverableEditDialog
          deliverable={selectedDeliverable}
          onOpenChange={setEditDeliverableOpen}
          open={editDeliverableOpen}
        />
      ) : null}

      <UploadPhaseMinutesDialog
        onOpenChange={setMeetingUploadOpen}
        open={meetingUploadOpen}
        phaseId={phase.id}
      />

      <TaskDialog
        dialogControl={{
          open: editTaskDialogOpen,
          onOpenChange: setEditTaskDialogOpen,
        }}
        initialData={selectedTask}
        phaseId={phase.id}
        users={users}
      />

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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteTaskId === null || isDeleting !== null}
              onClick={async () => {
                if (!deleteTaskId) {
                  return;
                }
                const task = tasks.find((t) => t.id === deleteTaskId);
                const taskTitle = task?.title || "Task";
                setDeleteTaskId(null);
                await confirmDeleteTask(deleteTaskId, taskTitle);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function MeetingLogCard({ log }: { log: MeetingLog }) {
  return (
    <Link
      className={cn(
        "flex items-center gap-3 rounded-md border bg-card p-3",
        "transition-colors hover:bg-accent/50"
      )}
      href={log.fileUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      <FileText className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 overflow-hidden">
        <h4 className="truncate font-medium text-sm">{log.title}</h4>
        <p className="text-muted-foreground text-xs">{formatDate(log.date)}</p>
      </div>
    </Link>
  );
}
