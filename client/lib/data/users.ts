/**
 * User Data Fetching Layer
 * * [FIX] Removed "use cache" for authenticated user data.
 * Session data must be dynamic (fetched per request) to securely 
 * validate the token against the backend signature.
 */

import "server-only";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { createAuthHeaders, serverClient } from "@/lib/api/server-client";
import type { User, UserContribution } from "@/lib/types";

/**
 * Fetch the currently logged-in user.
 * * [FIX] No try/catch. We let 401 errors bubble up so getAuthContext
 * can catch them and trigger the redirect to /login.
 */
export async function getCurrentUser(token: string): Promise<User> {
  const response = await serverClient.get<User>(API_ENDPOINTS.AUTH.ME, {
    headers: createAuthHeaders(token),
  });
  return response.data;
}

/**
 * Fetch all users.
 * * [FIX] Removed caching. Caching based on a short-lived auth token 
 * is inefficient (1 user = 1 cache entry) and risks showing stale data.
 */
export async function getUsers(token: string): Promise<User[]> {
  try {
    const response = await serverClient.get<User[]>(API_ENDPOINTS.USERS.LIST, {
      headers: createAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    // Returning empty array is safe for UI list, but consider re-throwing
    // if you want to show an error state.
    return [];
  }
}

export async function getUserById(
  id: string,
  token: string
): Promise<User | null> {
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

export async function getUserContribution(
  userId: string,
  token: string
): Promise<UserContribution | null> {
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
