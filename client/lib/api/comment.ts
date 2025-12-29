import type { Comment } from "@/lib/types";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreateCommentInput = {
  content: string;
  taskId?: string;
  deliverableId?: string;
};

export type UpdateCommentInput = {
  content: string;
};

export type CommentQuery = {
  taskId?: string;
  deliverableId?: string;
};

export const commentApi = {
  listComments: async (query?: CommentQuery): Promise<Comment[]> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMENTS.LIST, {
      params: query,
    });
    return response.data;
  },

  getCommentById: async (id: string): Promise<Comment> => {
    const response = await apiClient.get(API_ENDPOINTS.COMMENTS.GET(id));
    return response.data;
  },

  createComment: async (data: CreateCommentInput): Promise<Comment> => {
    const response = await apiClient.post(API_ENDPOINTS.COMMENTS.CREATE, data);
    return response.data;
  },

  updateComment: async (
    id: string,
    data: UpdateCommentInput
  ): Promise<Comment> => {
    const response = await apiClient.put(API_ENDPOINTS.COMMENTS.UPDATE(id), data);
    return response.data;
  },

  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.COMMENTS.DELETE(id));
  },
};
