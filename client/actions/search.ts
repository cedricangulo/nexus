"use server";

import type { AxiosError } from "axios";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { requireUser } from "@/lib/helpers/rbac";
import type { SearchResults } from "@/lib/types/search";

export async function globalSearchAction(query: string) {
  try {
    await requireUser();

    if (!query.trim() || query.length < 3) {
      return { success: true, data: null } as const;
    }

    const response = await apiClient.get<SearchResults>(
      API_ENDPOINTS.SEARCH.GLOBAL,
      {
        params: { q: query },
      }
    );

    return { success: true, data: response.data } as const;
  } catch (error) {
    console.error("[globalSearchAction] Error:", error);
    const axiosError = error as AxiosError<{ message?: string }>;
    const message =
      axiosError.response?.data?.message || "Search failed. Please try again.";
    return { success: false, error: message } as const;
  }
}
