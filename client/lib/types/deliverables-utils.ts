import { isDateInPast } from "@/lib/helpers/format-date";
import type { Deliverable, DeliverableStatus } from "@/lib/types";

export function isDeliverableOverdue(deliverable: Deliverable): boolean {
  if (!deliverable.dueDate) {
    return false;
  }
  if (deliverable.status === "COMPLETED") {
    return false;
  }
  return isDateInPast(deliverable.dueDate);
}

export function getDeliverableAccentClass(status: DeliverableStatus): string {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-status-in-progress";
    case "REVIEW":
      return "bg-status-review";
    case "COMPLETED":
      return "bg-status-completed";
    default:
      return "bg-status-not-started";
  }
}
