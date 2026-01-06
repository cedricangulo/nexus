/**
 * Deliverable Data Fetching Layer - Cache Components Compatible
 */

import { cacheLife, cacheTag } from "next/cache";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { createAuthHeaders, serverClient } from "@/lib/api/server-client";
import type { Comment, Deliverable, Evidence, Phase } from "@/lib/types";

export async function getDeliverableById(
  id: string,
  token: string
): Promise<Deliverable | null> {
  "use cache";
  cacheLife("weeks");
  cacheTag("deliverables", `deliverable-${id}`);

  try {
    const response = await serverClient.get<Deliverable>(
      API_ENDPOINTS.DELIVERABLES.GET(id),
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch deliverable ${id}:`, error);
    return null;
  }
}

export async function getDeliverables(token: string): Promise<Deliverable[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("deliverables");

  try {
    const response = await serverClient.get<Deliverable[]>(
      API_ENDPOINTS.DELIVERABLES.LIST,
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch deliverables:", error);
    return [];
  }
}

export async function getPhases(token: string): Promise<Phase[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("phases");

  try {
    const response = await serverClient.get<Phase[]>(
      API_ENDPOINTS.PHASES.LIST,
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch phases:", error);
    return [];
  }
}

export async function getEvidenceByDeliverable(
  deliverableId: string,
  token: string
): Promise<Evidence[]> {
  "use cache";
  cacheLife("weeks");
  cacheTag("evidence", `deliverable-${deliverableId}`);

  try {
    const response = await serverClient.get<Evidence[]>(
      API_ENDPOINTS.EVIDENCE.BY_DELIVERABLE(deliverableId),
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch evidence for deliverable ${deliverableId}:`,
      error
    );
    return [];
  }
}

export async function getCommentsByDeliverable(
  deliverableId: string,
  token: string
): Promise<Comment[]> {
  try {
    const response = await serverClient.get<Comment[]>(
      `${API_ENDPOINTS.COMMENTS.LIST}?deliverableId=${deliverableId}`,
      { headers: createAuthHeaders(token) }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch comments for deliverable ${deliverableId}:`,
      error
    );
    return [];
  }
}

export async function getDeliverableDetail(
  deliverableId: string,
  token: string
) {
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
}
