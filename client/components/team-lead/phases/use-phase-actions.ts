"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteDeliverableAction } from "@/actions/phases";
import { deletePhaseTaskAction } from "@/actions/tasks";
import { showPendingActionToast } from "@/components/shared/pending-action-toast";
import type { Deliverable, Task } from "@/lib/types";

export function usePhaseActions(phaseId: string) {
  const router = useRouter();

  // Task state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Deliverable state
  const [selectedDeliverable, setSelectedDeliverable] =
    useState<Deliverable | null>(null);
  const [createDeliverableOpen, setCreateDeliverableOpen] = useState(false);
  const [editDeliverableOpen, setEditDeliverableOpen] = useState(false);

  // Meeting state
  const [meetingUploadOpen, setMeetingUploadOpen] = useState(false);

  // Loading state
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Task actions
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditTaskDialogOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setDeleteTaskId(task.id);
  };

  const confirmDeleteTask = (id: string, title: string) => {
    setIsDeleting(id);

    showPendingActionToast({
      title: "Delete task",
      description: `We'll delete "${title}" in 10 seconds. Click Cancel to stop this action.`,
      duration: 10_000,
      onTimeout: async () => {
        try {
          const result = await deletePhaseTaskAction(id, phaseId);

          if (result.success) {
            toast.success(`Deleted: ${title}`);
            router.refresh();
          } else {
            toast.error(
              result.error || "Failed to delete task. Please try again."
            );
          }
        } catch (error) {
          console.error("Error deleting task:", error);
          toast.error("An unexpected error occurred");
        } finally {
          setIsDeleting(null);
        }
      },
      onCancel: () => {
        setIsDeleting(null);
        toast.info("Deletion cancelled, no changes were made.");
      },
    });
  };

  // Deliverable actions
  const handleEditDeliverable = (deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable);
    setEditDeliverableOpen(true);
  };

  const handleCreateDeliverable = () => {
    setCreateDeliverableOpen(true);
  };

  const handleDeleteDeliverable = (id: string, title: string) => {
    setIsDeleting(id);

    showPendingActionToast({
      title: "Delete deliverable",
      description: `We'll delete "${title}" in 10 seconds. Click Cancel to stop this action.`,
      duration: 10_000,
      onTimeout: async () => {
        try {
          const result = await deleteDeliverableAction(id);

          if (result.success) {
            toast.success(`Deleted: ${title}`);
            router.refresh();
          } else {
            toast.error(
              result.error ||
                "Could not delete the deliverable. Please try again."
            );
          }
        } catch (error) {
          console.error("Error deleting deliverable:", error);
          toast.error("An unexpected error occurred");
        } finally {
          setIsDeleting(null);
        }
      },
      onCancel: () => {
        setIsDeleting(null);
        toast.info("Deletion cancelled, no changes were made.");
      },
    });
  };

  return {
    // Task state and actions
    selectedTask,
    editTaskDialogOpen,
    setEditTaskDialogOpen,
    deleteTaskId,
    setDeleteTaskId,
    handleEditTask,
    handleDeleteTask,
    confirmDeleteTask,

    // Deliverable state and actions
    selectedDeliverable,
    createDeliverableOpen,
    setCreateDeliverableOpen,
    editDeliverableOpen,
    setEditDeliverableOpen,
    handleEditDeliverable,
    handleCreateDeliverable,
    handleDeleteDeliverable,

    // Meeting state
    meetingUploadOpen,
    setMeetingUploadOpen,

    // Shared state
    isDeleting,
  };
}
