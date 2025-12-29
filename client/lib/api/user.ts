import type { User, UserContribution } from "@/lib/types";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type UpdateUserInput = {
  name?: string;
  email?: string;
  role?: string;
};

export const userApi = {
  listUsers: async (): Promise<User[]> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST);
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.GET(id));
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserInput): Promise<User> => {
    const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
  },

  restoreUser: async (id: string): Promise<User> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.RESTORE(id));
    return response.data;
  },

  getUserContributions: async (id: string): Promise<UserContribution> => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.CONTRIBUTIONS(id));
    return response.data;
  },
};
