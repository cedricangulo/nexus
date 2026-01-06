/**
 * Users Data Fetching Layer - Cache Components Compatible
 *
 * Server-side data fetching for user lists with Cache Components support
 * Uses "use cache" directive for instant caching
 */

import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { createAuthHeaders, serverClient } from "@/lib/api/server-client";
import type { User, UserContribution } from "@/lib/types";

/**
 * Fetch all users in the system
 *
 * @param token - Authentication token for the request
 * @returns Array of all users
 */
export async function getUsers(token: string): Promise<User[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("users");

  try {
    const response = await serverClient.get<User[]>(API_ENDPOINTS.USERS.LIST, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

/**
 * Fetch a single user by ID
 *
 * @param id - User ID
 * @param token - Authentication token for the request
 * @returns User or null if not found
 */
export async function getUserById(
  id: string,
  token: string
): Promise<User | null> {
  "use cache";
  cacheLife("weeks");
  cacheTag("users", `user-${id}`);

  try {
    const response = await serverClient.get<User>(API_ENDPOINTS.USERS.GET(id), {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user ${id}:`, error);
    return null;
  }
}

/**
 * Fetch contribution statistics for a specific user
 *
 * @param userId - User ID
 * @param token - Authentication token for the request
 * @returns User contribution data
 */
export async function getUserContribution(
  userId: string,
  token: string
): Promise<UserContribution | null> {
  "use cache";
  cacheLife("weeks");
  cacheTag("users", `user-contribution-${userId}`);

  try {
    const response = await serverClient.get<UserContribution>(
      API_ENDPOINTS.USERS.CONTRIBUTIONS(userId),
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch contributions for user ${userId}:`, error);
    return null;
  }
}
