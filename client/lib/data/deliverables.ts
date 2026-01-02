import "server-only";

import { commentApi } from "@/lib/api/comment";
import { deliverableApi } from "@/lib/api/deliverable";
import { evidenceApi } from "@/lib/api/evidence";
import { phaseApi } from "@/lib/api/phase";
import type { Comment, Deliverable, Evidence, Phase } from "@/lib/types";
import { requireUser } from "../helpers/rbac";

export async function getDeliverableById(
  id: string
): Promise<Deliverable | null> {
  try {
    await requireUser();
    return await deliverableApi.getDeliverableById(id);
  } catch (error) {
    console.error(`Failed to fetch deliverable ${id}:`, error);
    return null;
  }
}

export async function getDeliverables(): Promise<Deliverable[]> {
  try {
    await requireUser();
    return await deliverableApi.listDeliverables();
  } catch (error) {
    console.error("Failed to fetch deliverables:", error);
    return [];
  }
}

export async function getPhases(): Promise<Phase[]> {
  try {
    await requireUser();
    return await phaseApi.listPhases();
  } catch (error) {
    console.error("Failed to fetch phases:", error);
    return [];
  }
}

export async function getEvidenceByDeliverable(
  deliverableId: string
): Promise<Evidence[]> {
  try {
    await requireUser();
    return await evidenceApi.getEvidenceByDeliverable(deliverableId);
  } catch (error) {
    console.error(
      `Failed to fetch evidence for deliverable ${deliverableId}:`,
      error
    );
    return [];
  }
}

export async function getCommentsByDeliverable(
  deliverableId: string
): Promise<Comment[]> {
  try {
    await requireUser();
    return await commentApi.listComments({ deliverableId });
  } catch (error) {
    console.error(
      `Failed to fetch comments for deliverable ${deliverableId}:`,
      error
    );
    return [];
  }
}

export async function getDeliverableDetail(deliverableId: string) {
  const [deliverable, phases, evidence, comments] = await Promise.all([
    getDeliverableById(deliverableId),
    getPhases(),
    getEvidenceByDeliverable(deliverableId),
    getCommentsByDeliverable(deliverableId),
  ]);

  return {
    deliverable,
    phases,
    evidence,
    comments,
    phase: phases.find((p) => p.id === deliverable?.phaseId),
  };
}
