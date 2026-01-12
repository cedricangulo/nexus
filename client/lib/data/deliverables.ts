/**
 * Deliverable Data Fetching Layer - Cache Components Compatible
 */

import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getApiClient } from "@/lib/api/server-client";
import type { Comment, Deliverable, Evidence, Phase } from "@/lib/types";
import { cache } from "react";

export const getDeliverableById = cache(async (
  id: string,
  token: string
): Promise<Deliverable | null> => {
  try {
    const api = await getApiClient(token);
    const response = await api.get<Deliverable>(
      API_ENDPOINTS.DELIVERABLES.GET(id)
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch deliverable ${id}:`, error);
    return null;
  }
})

export const getDeliverables = cache(async (token: string): Promise<Deliverable[]> => {
  try {
    const api = await getApiClient(token);
    const response = await api.get<Deliverable[]>(
      API_ENDPOINTS.DELIVERABLES.LIST
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch deliverables:", error);
    return [];
  }
})

export const getPhases = cache(async (token: string): Promise<Phase[]> => {
  try {
    const api = await getApiClient(token);
    const response = await api.get<Phase[]>(API_ENDPOINTS.PHASES.LIST);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch phases:", error);
    return [];
  }
})

export const getEvidenceByDeliverable = cache(async (
  deliverableId: string,
  token: string
): Promise<Evidence[]> => {

  try {
    const api = await getApiClient(token);
    const response = await api.get<Evidence[]>(
      API_ENDPOINTS.EVIDENCE.BY_DELIVERABLE(deliverableId)
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch evidence for deliverable ${deliverableId}`,
      error
    );
    return [];
  }
})

export const getCommentsByDeliverable = cache(async (
  deliverableId: string,
  token: string
): Promise<Comment[]> => {
  try {
    const api = await getApiClient(token);
    const response = await api.get<Comment[]>(
      `${API_ENDPOINTS.COMMENTS.LIST}?deliverableId=${deliverableId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch comments for deliverable ${deliverableId}:`,
      error
    );
    return [];
  }
})

export const getDeliverableDetail = cache(async (
  deliverableId: string,
  token: string
) => {
  const [deliverable, phases, evidence, comments] = await Promise.all([
    getDeliverableById(deliverableId, token),
    getPhases(token),
    getEvidenceByDeliverable(deliverableId, token),
    getCommentsByDeliverable(deliverableId, token),
  ]);

  return {
    deliverable,
    phases,
    evidence,
    comments,
    phase: phases.find((p) => p.id === deliverable?.phaseId),
  };
})
