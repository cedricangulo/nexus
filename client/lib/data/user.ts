/**
 * User Data Fetching Layer - Cache Components Compatible
 */

import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { createAuthHeaders, serverClient } from "@/lib/api/server-client";
import type { User } from "@/lib/types";

export async function getCurrentUser(token: string): Promise<User | null> {
  "use cache";
  cacheLife("weeks");
  cacheTag("current-user");

  try {
    const response = await serverClient.get<User>(API_ENDPOINTS.AUTH.ME, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}
