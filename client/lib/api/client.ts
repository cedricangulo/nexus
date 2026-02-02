"use server";

import axios, { type AxiosError, type AxiosInstance } from "axios";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_BASE_URL = `${API_URL}/api/v1`;

// Cache for cookie store to avoid multiple reads per request
let cachedCookies: Awaited<ReturnType<typeof cookies>> | null = null;

async function getCookieStore() {
  if (!cachedCookies) {
    cachedCookies = await cookies();
  }
  return cachedCookies;
}

// Reset cookie cache (called after mutations that change auth state)
export async function resetCookieCache() {
  cachedCookies = null;
}

// Singleton instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  withCredentials: true, // Send httpOnly cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Add auth token if available
apiClient.interceptors.request.use(
  async (config) => {
    const cookieStore = await getCookieStore();
    const token = cookieStore.get("auth_token")?.value;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = config.method?.toUpperCase();
    const hasBody = config.data !== undefined && config.data !== null;

    // Some servers reject DELETE with Content-Type but no body.
    if (method === "DELETE" && !hasBody && config.headers) {
      if (config.headers instanceof axios.AxiosHeaders) {
        config.headers.delete("Content-Type");
      } else {
        // Safe cast for plain object manipulation
        const headers = config.headers as Record<string, unknown>;
        headers["Content-Type"] = undefined;
      }
    }

    // Our API uses PATCH endpoints with no payload.
    // Ensure an empty JSON body exists to satisfy strict servers.
    if (method === "PATCH" && !hasBody) {
      config.data = {};
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401: Token expired or invalid - clear auth and let client handle redirect
    if (error.response?.status === 401) {
      await resetCookieCache();
      const cookieStore = await cookies();
      cookieStore.delete("auth_token");
      // Error will propagate to caller for proper error handling
    }

    if (error.code === "ECONNABORTED") {
      const timeout = new Error(
        "Request timeout. Please check your connection."
      );
      return Promise.reject(timeout);
    }

    return Promise.reject(error);
  }
);

export const createApiClient = async (): Promise<AxiosInstance> => apiClient;
