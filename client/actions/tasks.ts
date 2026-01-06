"use server";

import type { AxiosError } from "axios";
import { revalidatePath, updateTag } from "next/cache";

import { phaseApi } from "@/lib/api/phase";
import { taskApi } from "@/lib/api/task";
import {
  requireContributor,
  requireTeamLead,
  requireUser,
} from "@/lib/helpers/rbac";
import type { Task } from "@/lib/types";
import {
  createPhaseTaskSchema,
  createSprintTaskSchema,
  updatePhaseTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "@/lib/validation";

export async function createSprintTaskAction(input: unknown) {
  try {
    // Security: Team Lead only - creates tasks and assigns them
    await requireTeamLead();

    const parsed = createSprintTaskSchema.parse(input);

    await taskApi.createTask({
      sprintId: parsed.sprintId,
      title: parsed.title,
      description: parsed.description ? parsed.description : undefined,
      assigneeIds:
        parsed.assigneeIds && parsed.assigneeIds.length > 0
          ? parsed.assigneeIds
          : undefined,
    });

    updateTag("sprints");
    revalidatePath(`/sprints/${parsed.sprintId}`);
    return { success: true } as const;
  } catch (error) {
    console.error("[createSprintTaskAction] Error:", error);
    return { success: false, error: "Failed to create task" } as const;
  }
}

export async function updateTaskStatusAction(input: unknown) {
  try {
    // Security: Ensure user is authenticated
    await requireUser();

    const parsed = updateTaskStatusSchema.parse(input);
    const comment = parsed.comment === "" ? undefined : parsed.comment;

    await taskApi.updateTaskStatus(parsed.taskId, {
      status: parsed.status,
      comment,
    });

    updateTag("sprints");
    revalidatePath(`/sprints/${parsed.sprintId}`);
    return { success: true } as const;
  } catch (error) {
    console.error("[updateTaskStatusAction] Error:", error);

    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
    }>;
    const apiMessage =
      axiosError.response?.data?.error || axiosError.response?.data?.message;

    return {
      success: false,
      error: apiMessage || "Failed to update task status",
    } as const;
  }
}

export async function updateTaskAction(input: unknown) {
  try {
    // Security: Team Lead only - manages task assignments and details
    await requireTeamLead();

    const parsed = updateTaskSchema.parse(input);

    await taskApi.updateTask(parsed.taskId, {
      title: parsed.title,
      description: parsed.description ? parsed.description : undefined,
      assigneeIds:
        parsed.assigneeIds && parsed.assigneeIds.length > 0
          ? parsed.assigneeIds
          : [],
    });

    updateTag("sprints");
    revalidatePath(`/sprints/${parsed.sprintId}`);
    return { success: true } as const;
  } catch (error) {
    console.error("[updateTaskAction] Error:", error);

    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
    }>;
    const apiMessage =
      axiosError.response?.data?.error || axiosError.response?.data?.message;

    return {
      success: false,
      error: apiMessage || "Failed to update task",
    } as const;
  }
}

export async function updatePhaseTaskAction(input: unknown, phaseId: string) {
  try {
    // Security: Team Lead & Members
    const user = await requireContributor();

    const parsed = updatePhaseTaskSchema.parse(input);

    // Members cannot modify assignees - don't send assigneeIds
    const updateData = {
      title: parsed.title,
      description: parsed.description ? parsed.description : undefined,
      status: parsed.status,
    };

    if (user.role === "teamLead" && parsed.assigneeIds) {
      Object.assign(updateData, {
        assigneeIds: parsed.assigneeIds.length > 0 ? parsed.assigneeIds : [],
      });
    }

    await taskApi.updateTask(parsed.taskId, updateData);

    updateTag("phases");
    revalidatePath(`/phases/${phaseId}`);
    return { success: true } as const;
  } catch (error) {
    console.error("[updatePhaseTaskAction] Error:", error);

    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
    }>;
    const apiMessage =
      axiosError.response?.data?.error || axiosError.response?.data?.message;

    return {
      success: false,
      error: apiMessage || "Failed to update task",
    } as const;
  }
}

export async function getTaskDetailAction(
  taskId: string
): Promise<Task | null> {
  try {
    // Security: Ensure user is authenticated
    await requireUser();

    return await taskApi.getTaskById(taskId);
  } catch (error) {
    console.error("[getTaskDetailAction] Error:", error);
    return null;
  }
}

export async function createPhaseTaskAction(input: unknown) {
  try {
    // Security: Team Lead only - creates waterfall tasks and assigns them
    await requireTeamLead();

    const parsed = createPhaseTaskSchema.parse(input);

    await phaseApi.createPhaseTask({
      phaseId: parsed.phaseId,
      title: parsed.title,
      description: parsed.description ? parsed.description : undefined,
      status: parsed.status,
      assigneeIds:
        parsed.assigneeIds && parsed.assigneeIds.length > 0
          ? parsed.assigneeIds
          : undefined,
    });

    updateTag("phases");
    revalidatePath(`/phases/${parsed.phaseId}`);
    return { success: true } as const;
  } catch (error) {
    console.error("[createPhaseTaskAction] Error:", error);

    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
    }>;
    const apiMessage =
      axiosError.response?.data?.error || axiosError.response?.data?.message;

    return {
      success: false,
      error: apiMessage || "Failed to create task",
    } as const;
  }
}

export async function deletePhaseTaskAction(taskId: string, phaseId: string) {
  try {
    // Security: Team Lead only
    await requireTeamLead();

    await taskApi.deleteTask(taskId);

    updateTag("phases");
    revalidatePath(`/phases/${phaseId}`);
    return { success: true } as const;
  } catch (error) {
    console.error("[deletePhaseTaskAction] Error:", error);

    const axiosError = error as AxiosError<{
      error?: string;
      message?: string;
    }>;
    const apiMessage =
      axiosError.response?.data?.error || axiosError.response?.data?.message;

    return {
      success: false,
      error: apiMessage || "Failed to delete task",
    } as const;
  }
}
