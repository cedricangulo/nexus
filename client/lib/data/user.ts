import { cache } from "react";
import { createApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { requireUser } from "@/lib/helpers/rbac";
import type { User } from "@/lib/types";

/**
 * Fetches the current authenticated user.
 * Wrapped in cache() to eliminate redundant API calls during a single render pass.
 * @returns Current user data or null if not authenticated
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    await requireUser();
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
});
