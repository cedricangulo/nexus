import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getApiClient } from "@/lib/api/server-client";
import type { User } from "@/lib/types";
import { cache } from "react";

/**
 * Fetches the current authenticated user.
 * Throws on failure to prevent caching error states.
 */
export const getCurrentUser = cache(async (token: string): Promise<User> => {
  // Errors bubble up - callers must handle them
  // This prevents caching null/failure responses
  const api = await getApiClient(token);
  const response = await api.get<User>(API_ENDPOINTS.AUTH.ME);

  return response.data;
})
