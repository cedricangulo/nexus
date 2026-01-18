import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { SidebarMenuBadge } from "@/components/ui/sidebar";
import { getBadgeCounts, type BadgeCounts } from "@/lib/data/badge-counts";
import { formatBadgeCount } from "@/lib/config/nav";
import { Skeleton } from "../ui/skeleton";

type NavBadgeProps = {
  token: string;
  countKey: keyof BadgeCounts;
  variant: "default" | "info" | "error" | "warning";
  labelSuffix: string;
};

/**
 * Async Server Component
 * Fetches badge counts and renders the badge.
 * React.cache in getBadgeCounts ensures single fetch across all NavBadge instances.
 */
async function AsyncBadge({
  token,
  countKey,
  variant,
  labelSuffix,
}: NavBadgeProps) {
  const counts = await getBadgeCounts(token);
  const count = counts?.[countKey] || 0;

  if (count === 0) return null;

  return (
    <SidebarMenuBadge className="font-sora text-xs">
      <Badge variant={variant}>
        {formatBadgeCount(count)} {labelSuffix}
      </Badge>
    </SidebarMenuBadge>
  );
}

/**
 * Badge Skeleton
 * Shown while badge count is loading.
 */
function BadgeSkeleton() {
  return (
    <SidebarMenuBadge>
      <Skeleton className="h-4 w-16" />
    </SidebarMenuBadge>
  );
}

/**
 * NavBadge Component
 *
 * Self-contained badge with its own Suspense boundary.
 * Each badge loads independently; if one fails, others still render.
 *
 * @example
 * <NavBadge
 *   token={token}
 *   countKey="deliverablesInReview"
 *   variant="info"
 *   labelSuffix="Review"
 * />
 */
export function NavBadge(props: NavBadgeProps) {
  return (
    <Suspense fallback={<BadgeSkeleton />}>
      <AsyncBadge {...props} />
    </Suspense>
  );
}
