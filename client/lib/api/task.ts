import type { Task, TaskStatus } from "@/lib/types";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreateTaskInput = {
  sprintId: string;
  assigneeIds?: string[];
  title: string;
  description?: string;
};

export type UpdateTaskInput = {
  assigneeIds?: string[];
  title?: string;
  description?: string;
  status?: TaskStatus;
};

export type UpdateTaskStatusInput = {
  status: TaskStatus;
  comment?: string;
};

export type TaskQuery = {
  sprintId?: string;
  assigneeId?: string;
  status?: TaskStatus;
};

export const taskApi = {
  listTasks: async (query?: TaskQuery): Promise<Task[]> => {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.LIST, {
      params: query,
    });
    return response.data;
  },

  getTaskById: async (id: string): Promise<Task> => {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.GET(id));
    return response.data;
  },

  createTask: async (data: CreateTaskInput): Promise<Task> => {
    const response = await apiClient.post(API_ENDPOINTS.TASKS.CREATE, data);
    return response.data;
  },

  updateTask: async (id: string, data: UpdateTaskInput): Promise<Task> => {
    const response = await apiClient.put(API_ENDPOINTS.TASKS.UPDATE(id), data);
    return response.data;
  },

  updateTaskStatus: async (
    id: string,
    data: UpdateTaskStatusInput
  ): Promise<Task> => {
    const response = await apiClient.patch(
      API_ENDPOINTS.TASKS.UPDATE_STATUS(id),
      data
    );
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.TASKS.DELETE(id));
  },

  restoreTask: async (id: string): Promise<Task> => {
    const response = await apiClient.post(API_ENDPOINTS.TASKS.RESTORE(id));
    return response.data;
  },
};
