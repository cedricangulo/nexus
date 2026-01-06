/**
 * Clean Server Client for Cached Functions
 *
 * This is a "poison-free" Axios instance that does NOT use interceptors.
 * It allows cached functions to make API calls without triggering dynamic cookies().
 *
 * USAGE PATTERN:
 * 1. Extract token at the Page level (dynamic boundary)
 * 2. Pass token as string to cached data functions
 * 3. Use this serverClient with manual Authorization header
 *
 * DO NOT add interceptors to this client.
 */

import axios from "axios";

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
 * Helper to create authorization headers
 */
export function createAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
