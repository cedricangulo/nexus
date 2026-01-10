import { Suspense } from "react";
import { getBadgeCounts } from "@/lib/data/badge-counts";
import type { User } from "@/lib/types";
import { SidebarRenderer } from "./sidebar-badge-client";

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
    return <SidebarRenderer user={user} variant={variant} />;
  }

  // Fetch badge counts on the server (streamed via Suspense)
  const badgeCounts = await getBadgeCounts(user);

  // Render with SidebarRenderer for hydration-safe display
  return (
    <SidebarRenderer badgeCounts={badgeCounts} user={user} variant={variant} />
  );
}

/**
 * Fallback UI shown while badge counts are loading
 * Uses SidebarRenderer for consistent structure
 */
function SidebarFallback({
  user,
  variant,
}: {
  user: User | null;
  variant: "team-lead" | "member";
}) {
  return <SidebarRenderer user={user} variant={variant} />;
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
