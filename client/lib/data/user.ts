/**
 * User Data Fetching Layer - Cache Components Compatible
 */
"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { createAuthHeaders, serverClient } from "@/lib/api/server-client";
import type { User } from "@/lib/types";

/**
 * Fetches the current authenticated user.
 * Throws on failure to prevent caching error states.
 */
export async function getCurrentUser(token: string): Promise<User> {
  cacheLife("hours"); // Reduced from weeks to prevent stale data issues
  cacheTag("current-user");

  // Errors bubble up - callers must handle them
  // This prevents caching null/failure responses
  const response = await serverClient.get<User>(API_ENDPOINTS.AUTH.ME, {
    headers: createAuthHeaders(token),
  });
  return response.data;
}
