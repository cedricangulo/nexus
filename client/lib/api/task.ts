import type { Task, TaskStatus } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreateTaskInput = {
  sprintId: string;
  assigneeId?: string;
  title: string;
  description?: string;
};

export type UpdateTaskInput = {
  assigneeId?: string | null;
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
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.TASKS.LIST, {
      params: query,
    });
    return response.data;
  },

  getTaskById: async (id: string): Promise<Task> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.TASKS.GET(id));
    return response.data;
  },

  createTask: async (data: CreateTaskInput): Promise<Task> => {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.TASKS.CREATE, data);
    return response.data;
  },

  updateTask: async (id: string, data: UpdateTaskInput): Promise<Task> => {
    const client = await createApiClient();
    const response = await client.put(API_ENDPOINTS.TASKS.UPDATE(id), data);
    return response.data;
  },

  updateTaskStatus: async (
    id: string,
    data: UpdateTaskStatusInput
  ): Promise<Task> => {
    const client = await createApiClient();
    const response = await client.patch(
      API_ENDPOINTS.TASKS.UPDATE_STATUS(id),
      data
    );
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    const client = await createApiClient();
    await client.delete(API_ENDPOINTS.TASKS.DELETE(id));
  },

  restoreTask: async (id: string): Promise<Task> => {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.TASKS.RESTORE(id));
    return response.data;
  },
};
