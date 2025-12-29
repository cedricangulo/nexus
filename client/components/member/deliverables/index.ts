/**
 * Member Deliverables Components
 *
 * Read-only deliverables view for team members.
 * Shares core components with team lead but without approval/feedback dialogs.
 */

export type { MemberDeliverablesClientProps } from "./client";

import { MemberDeliverablesClient as Client } from "./client";
export { Client as MemberDeliverablesClient };

/**
 * Member Deliverables Components
 *
 * Barrel export for all member-specific deliverable components.
 */

export { default as MemberDeliverableActions } from "./actions";
export { UploadEvidenceDialog } from "./upload-evidence-dialog";
