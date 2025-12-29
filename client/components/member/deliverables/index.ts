/**
 * Member Deliverables Components
 *
 * Read-only deliverables view for team members.
 * Shares core components with team lead but without approval/feedback dialogs.
 */

export type { MemberDeliverablesClientProps } from "./client";

import { MemberDeliverablesClient as Client } from "./client";
export { Client as MemberDeliverablesClient };
