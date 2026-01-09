"use client";

import { useEffect, useState } from "react";
import type { BadgeCounts } from "@/lib/data/badge-counts";
import type { User } from "@/lib/types";
import { AppSidebar as MemberSidebar } from "./member/member-sidebar";
import { AppSidebar as TeamLeadSidebar } from "./team-lead/team-lead-sidebar";

const DEFAULT_BADGE_COUNTS: BadgeCounts = {
  deliverablesInReview: 0,
  blockedTasks: 0,
  phasesWithoutMeetings: 0,
  todayActivityCount: 0,
};

/**
 * Hook to track hydration state
 * Returns false during SSR/initial render, true after client hydration
 */
function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

type SidebarRendererProps = {
  user: User | null;
  variant: "team-lead" | "member";
  badgeCounts?: BadgeCounts;
};

/**
 * Client-side sidebar renderer with hydration-safe badge display
 *
 * This component ensures consistent rendering between server and client by:
 * 1. Using default (zero) counts during SSR and initial hydration
 * 2. Switching to actual counts after hydration completes
 *
 * This prevents hydration mismatches caused by timing differences
 * in async data fetching between server and client.
 */
export function SidebarRenderer({
  user,
  variant,
  badgeCounts,
}: SidebarRendererProps) {
  const isHydrated = useIsHydrated();

  // Before hydration: always use default counts (deterministic)
  // After hydration: use actual counts (may differ)
  const counts = isHydrated ? badgeCounts : DEFAULT_BADGE_COUNTS;
  const finalCounts = counts ?? DEFAULT_BADGE_COUNTS;

  if (!user) {
    return variant === "team-lead" ? (
      <TeamLeadSidebar user={user} />
    ) : (
      <MemberSidebar user={user} />
    );
  }

  return variant === "team-lead" ? (
    <TeamLeadSidebar badgeCounts={finalCounts} user={user} />
  ) : (
    <MemberSidebar badgeCounts={finalCounts} user={user} />
  );
}
