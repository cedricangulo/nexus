/**
 * Navigation Configuration
 *
 * Single source of truth for all sidebar navigation items.
 * Edit this file to add/remove/modify nav links for any role.
 */

import {
  CalendarDays,
  HardDriveDownload,
  IterationCcw,
  Layers,
  LayoutDashboard,
  ListTree,
  type LucideIcon,
  Package,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { BadgeCounts } from "@/lib/data/badge-counts";

export type Role = "MEMBER" | "TEAM_LEAD" | "ADVISER";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export type NavConfig = Record<Role, NavGroup[]>;

/**
 * Badge configuration for nav items
 * Maps route paths to badge display settings
 */
export type BadgeConfig = {
  countKey: keyof BadgeCounts;
  variant: "info" | "error" | "warning";
  labelSuffix: string;
};

export const BADGE_CONFIG: Record<string, BadgeConfig> = {
  "/settings/activity-logs": {
    countKey: "todayActivityCount",
    variant: "info",
    labelSuffix: "Today",
  },
  "/deliverables": {
    countKey: "deliverablesInReview",
    variant: "info",
    labelSuffix: "Review",
  },
  "/sprints": {
    countKey: "blockedTasks",
    variant: "error",
    labelSuffix: "Blocked",
  },
  "/meetings": {
    countKey: "phasesWithoutMeetings",
    variant: "warning",
    labelSuffix: "Missing",
  },
};

/**
 * Navigation configuration per role
 *
 * Structure:
 * - Each role has an array of NavGroups
 * - Groups without a label render items without a section header
 * - Groups with a label render a collapsible section
 */
export const NAV_CONFIG: NavConfig = {
  MEMBER: [
    {
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "Phases", href: "/phases", icon: Layers },
        { title: "Deliverables", href: "/deliverables", icon: Package },
        { title: "Sprints", href: "/sprints", icon: IterationCcw },
        { title: "Meetings", href: "/meetings", icon: CalendarDays },
      ],
    },
  ],

  TEAM_LEAD: [
    {
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "Activity", href: "/settings/activity-logs", icon: ListTree },
      ],
    },
    {
      label: "Project Execution",
      items: [
        { title: "Phases", href: "/phases", icon: Layers },
        { title: "Sprints", href: "/sprints", icon: IterationCcw },
        { title: "Deliverables", href: "/deliverables", icon: Package },
      ],
    },
    {
      label: "Team & Comms",
      items: [
        { title: "Meetings", href: "/meetings", icon: CalendarDays },
        { title: "Members", href: "/settings/team-members", icon: Users },
      ],
    },
    {
      label: "System",
      items: [
        {
          title: "Configuration",
          href: "/settings/project-config",
          icon: SlidersHorizontal,
        },
        { title: "Backup", href: "/settings/backup", icon: HardDriveDownload },
      ],
    },
  ],

  ADVISER: [
    {
      items: [
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "Phases", href: "/phases", icon: Layers },
        { title: "Deliverables", href: "/deliverables", icon: Package },
        { title: "Sprints", href: "/sprints", icon: IterationCcw },
        { title: "Meetings", href: "/meetings", icon: CalendarDays },
      ],
    },
  ],
};

/**
 * Helper: Format count as string, showing "9+" if > 9
 */
export const formatBadgeCount = (count: number): string =>
  count > 9 ? "9+" : count.toString();
