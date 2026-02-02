import axios, { type AxiosError, type AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_BASE_URL = `${API_URL}/api/v1`;

// Client-side API client for use in client components with auth support
export const createClientSideApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30_000,
    withCredentials: true, // Send cookies (auth_token) with requests
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Response interceptor: Handle 401 errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // On 401, token is invalid or expired
      // Client components should handle this and redirect to login
      if (error.response?.status === 401) {
        // Could trigger a logout event or state update here if needed
        // For now, let the error propagate to the component
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

  return client;
};
