/**
 * Clean Server Client for Cached Functions
 *
 * This is a "poison-free" Axios instance that does NOT use interceptors.
 * It allows cached functions to make API calls without triggering dynamic cookies().
 *
 * USAGE PATTERN:
 * 1. Extract token at the Page level (dynamic boundary)
 * 2. Pass token as string to cached data functions
 * 3. Use getApiClient() to get pre-authenticated instance
 *
 * DO NOT add interceptors to this client.
 */

import axios from "axios";
import { getAuthContext } from "@/lib/helpers/auth-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_BASE_URL = `${API_URL}/api/v1`;

/**
 * Clean Axios client with NO interceptors
 * Token must be manually passed to each request
 */
export const serverClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Smart Client Factory
 * 
 * Auto-resolves token (Explicit -> Cookie Fallback) and returns an Axios instance 
 * with Authorization header PRE-SET.
 * 
 * @param explicitToken - Optional token to use. If not provided, falls back to cookies.
 * @returns Axios instance with Authorization header pre-configured
 * 
 * @example
 * ```typescript
 * // In cached component (token passed from parent)
 * const api = await getApiClient(token);
 * const response = await api.get<Phase[]>(API_ENDPOINTS.PHASES.LIST);
 * 
 * // In dynamic component (auto-fetches from cookies)
 * const api = await getApiClient();
 * const response = await api.get<User>(API_ENDPOINTS.USERS.ME);
 * ```
 */
export async function getApiClient(explicitToken?: string) {
  let token = explicitToken;

  // Fallback: If no token passed, try to grab from cookies
  // This is safe in Dynamic Pages, but will throw in 'use cache' if no explicit token is provided.
  if (!token) {
    const auth = await getAuthContext();
    token = auth.token;
  }

  // Return fresh instance with headers
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 30_000,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Helper to create authorization headers
 * @deprecated Use getApiClient() instead for cleaner code
 */
export function createAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
