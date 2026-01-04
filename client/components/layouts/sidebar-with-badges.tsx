import { Suspense } from "react";
import { getBadgeCounts } from "@/lib/data/badge-counts";
import type { User } from "@/lib/types";
import { AppSidebar as MemberSidebar } from "./member/member-sidebar";
import { AppSidebar as TeamLeadSidebar } from "./team-lead/team-lead-sidebar";

/**
 * Async server component that fetches badge counts
 * Part of the SidebarBadgeLoader Suspense boundary
 */
async function SidebarBadgeContent({
  user,
  variant,
}: {
  user: User | null;
  variant: "team-lead" | "member";
}) {
  if (!user) {
    // Render sidebar without badges if no user
    return variant === "team-lead" ? (
      <TeamLeadSidebar user={user} />
    ) : (
      <MemberSidebar user={user} />
    );
  }

  // Fetch badge counts on the server (streamed via Suspense)
  const badgeCounts = await getBadgeCounts(user);

  // Render the appropriate sidebar with badges
  return variant === "team-lead" ? (
    <TeamLeadSidebar badgeCounts={badgeCounts} user={user} />
  ) : (
    <MemberSidebar badgeCounts={badgeCounts} user={user} />
  );
}

/**
 * Fallback UI shown while badge counts are loading
 * Renders sidebar without badge data
 */
function SidebarFallback({
  user,
  variant,
}: {
  user: User | null;
  variant: "team-lead" | "member";
}) {
  // Render sidebar without badge data as placeholder
  return variant === "team-lead" ? (
    <TeamLeadSidebar user={user} />
  ) : (
    <MemberSidebar user={user} />
  );
}

/**
 * SidebarBadgeLoader
 *
 * Wraps the sidebar component with a Suspense boundary to load badge counts
 * without blocking the page render. Badge counts are fetched asynchronously
 * and streamed to the sidebar once available.
 *
 * @param user - Current authenticated user
 * @param variant - Sidebar variant (team-lead or member)
 *
 * @example
 * <SidebarBadgeLoader user={user} variant="team-lead" />
 */
export function SidebarBadgeLoader({
  user,
  variant = "team-lead",
}: {
  user: User | null;
  variant?: "team-lead" | "member";
}) {
  return (
    <Suspense fallback={<SidebarFallback user={user} variant={variant} />}>
      <SidebarBadgeContent user={user} variant={variant} />
    </Suspense>
  );
}
