import type { LoginResponse, User } from "@/lib/types";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  changePassword: async (
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      oldPassword,
      newPassword,
    });
  },

  inviteUser: async (
    email: string,
    name: string,
    role: string
  ): Promise<User> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.INVITE, {
      email,
      name,
      role,
    });
    return response.data;
  },
};
