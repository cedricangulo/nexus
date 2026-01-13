/**
 * Deliverable Data Fetching Layer - Cache Components Compatible
 */

import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getApiClient } from "@/lib/api/server-client";
import type { Comment, Deliverable, Evidence, Phase } from "@/lib/types";
import { DeliverableStatus, PhaseType } from "@/lib/types";
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
  const [deliverable, phases] = await Promise.all([
    getDeliverableById(deliverableId, token),
    getPhases(token),
  ]);

  return {
    deliverable,
    phases,
    phase: phases.find((p) => p.id === deliverable?.phaseId),
  };
})

// New filter and count functions for nuqs integration

export type DeliverablesFilters = {
  query?: string;
  phase?: PhaseType | "ALL";
  status?: DeliverableStatus | "ALL";
};

function filterDeliverables(
  deliverables: Deliverable[],
  phases: Phase[],
  filters: DeliverablesFilters
): Deliverable[] {
  const { query, phase, status } = filters;
  const normalizedQuery = query?.trim().toLowerCase() || "";

  // Create phase type lookup
  const phaseTypeMap = new Map(phases.map(p => [p.id, p.type]));

  return deliverables
    .filter((d) => {
      // Phase filter
      if (phase && phase !== "ALL") {
        const phaseType = phaseTypeMap.get(d.phaseId);
        if (phaseType !== phase) return false;
      }
      return true;
    })
    .filter((d) => {
      // Status filter
      if (status && status !== "ALL") {
        if (d.status !== status) return false;
      }
      return true;
    })
    .filter((d) => {
      // Query filter
      if (normalizedQuery) {
        return d.title.toLowerCase().includes(normalizedQuery);
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by due date
      const aDue = a.dueDate
        ? new Date(a.dueDate).getTime()
        : Number.POSITIVE_INFINITY;
      const bDue = b.dueDate
        ? new Date(b.dueDate).getTime()
        : Number.POSITIVE_INFINITY;
      return aDue - bDue;
    });
}

export const getFilteredDeliverables = cache(async (
  token: string,
  filters: DeliverablesFilters
): Promise<Deliverable[]> => {
  const [deliverables, phases] = await Promise.all([
    getDeliverables(token),
    getPhases(token),
  ]);
  return filterDeliverables(deliverables, phases, filters);
})

export const getTotalDeliverablesCount = cache(async (
  token: string,
  filters: DeliverablesFilters
): Promise<number> => {
  const filtered = await getFilteredDeliverables(token, filters);
  return filtered.length;
})

export const getOverdueDeliverablesCount = cache(async (
  token: string,
  filters: DeliverablesFilters
): Promise<number> => {
  const filtered = await getFilteredDeliverables(token, filters);
  const now = new Date();
  return filtered.filter((d) => {
    if (!d.dueDate) return false;
    if (d.status === DeliverableStatus.COMPLETED) return false;
    return new Date(d.dueDate) < now;
  }).length;
})

export const getDeliverablesForTimeline = cache(async (
  token: string,
  filters: DeliverablesFilters
): Promise<Deliverable[]> => {
  // Same as filtered deliverables, already sorted by due date
  return getFilteredDeliverables(token, filters);
})

export const getEvidenceCount = cache(async (
  deliverableId: string,
  token: string
): Promise<number> => {
  const evidence = await getEvidenceByDeliverable(deliverableId, token);
  return evidence.length;
})
