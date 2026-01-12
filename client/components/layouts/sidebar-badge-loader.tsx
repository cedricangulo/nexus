import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { NavBadge } from "./nav-badge";
import { BADGE_CONFIG } from "@/lib/config/nav";
import type { User } from "@/lib/types";

type SidebarBadgeLoaderProps = {
  user: User;
  token: string;
};

/**
 * SidebarBadgeLoader
 *
 * Composes the AppSidebar with NavBadge slots.
 * Each NavBadge has its own Suspense boundary for granular loading.
 *
 * Pattern: "Donut Pattern" / "Slot Pattern"
 * - AppSidebar (Client): Pure UI shell, renders whatever ReactNode is passed
 * - NavBadge (Server): Async component that fetches and renders its own badge
 *
 * @example
 * <SidebarBadgeLoader user={user} token={token} />
 */
export function SidebarBadgeLoader({ user, token }: SidebarBadgeLoaderProps) {
  // Create badge slots from BADGE_CONFIG
  const badgeSlots: Record<string, ReactNode> = {};

  for (const [href, config] of Object.entries(BADGE_CONFIG)) {
    badgeSlots[href] = (
      <NavBadge
        countKey={config.countKey}
        labelSuffix={config.labelSuffix}
        token={token}
        variant={config.variant}
      />
    );
  }

  return <AppSidebar badges={badgeSlots} user={user} />;
}
