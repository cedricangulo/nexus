import type { SearchResults } from "../types/search";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type SearchQuery = {
  q: string;
};

export const searchApi = {
  searchGlobal: async (query: string): Promise<SearchResults> => {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH.GLOBAL, {
      params: { q: query },
    });
    return response.data;
  },
};
