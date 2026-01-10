"use client";

import {
  Atom,
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
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { BadgeCounts } from "@/lib/data/badge-counts";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NavUser } from "../nav-user";

type NavItem = {
  title: string;
  href?: string;
  icon?: LucideIcon;
  items?: NavItem[];
};

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Activity", href: "/settings/activity-logs", icon: ListTree },
  {
    title: "Project Execution",
    items: [
      { title: "Phases", href: "/phases", icon: Layers },
      { title: "Sprints", href: "/sprints", icon: IterationCcw },
      { title: "Deliverables", href: "/deliverables", icon: Package },
    ],
  },
  {
    title: "Team & Comms",
    items: [
      { title: "Meetings", href: "/meetings", icon: CalendarDays },
      { title: "Members", href: "/settings/team-members", icon: Users },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Configuration",
        href: "/settings/project-config",
        icon: SlidersHorizontal,
      },
      { title: "Backup", href: "/settings/backup", icon: HardDriveDownload },
    ],
  },
] as const;

const AUTH_ROUTE_REGEX = /^\/(auth)/;

type SubItemProps = {
  subItem: {
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
  };
  isActive: (href: string) => boolean;
  badgeConfig: {
    variant: "default" | "info" | "error" | "warning";
    label: string;
  } | null;
};

function SidebarSubMenuItem({ subItem, isActive, badgeConfig }: SubItemProps) {
  const href = subItem.href || "";
  const active = isActive(href);
  const Icon = subItem.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active}>
        <Link href={href}>
          {Icon && (
            <Icon className={cn(active && "text-primary dark:text-blue-500")} />
          )}
          <span>{subItem.title}</span>
        </Link>
      </SidebarMenuButton>
      {badgeConfig?.label && (
        <SidebarMenuBadge className="font-sora text-xs">
          <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

type AppSidebarProps = {
  user: User | null;
  badgeCounts?: BadgeCounts;
};

/**
 * Helper: Format count as string, showing "9+" if > 9
 */
const _formatCount = (count: number): string =>
  count > 9 ? "9+" : count.toString();

/**
 * Badge configuration map
 * Maps routes to their badge display configuration
 */
const BADGE_CONFIG: Record<
  string,
  {
    countKey: keyof BadgeCounts;
    variant: "default" | "info" | "error" | "warning";
    labelSuffix: string;
  }
> = {
  "/settings/activity-logs": {
    countKey: "todayActivityCount",
    variant: "default",
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

export function AppSidebar({ user, badgeCounts }: AppSidebarProps) {
  const pathname = usePathname();

  // Always provide defaults to ensure consistent rendering
  const counts: BadgeCounts = badgeCounts ?? {
    deliverablesInReview: 0,
    blockedTasks: 0,
    phasesWithoutMeetings: 0,
    todayActivityCount: 0,
  };

  // Strip the (auth) route group from pathname
  const cleanPathname = pathname.replace(AUTH_ROUTE_REGEX, "") || "/";

  const isActive = (href: string) => {
    if (href === "#") {
      return false;
    }
    return cleanPathname === href;
  };

  // Get badge config for each route using configuration map
  const getBadgeConfig = (href: string) => {
    if (!counts) {
      return null;
    }

    const config = BADGE_CONFIG[href];
    if (!config) {
      return null;
    }

    const count = counts[config.countKey];
    if (count === 0) {
      return null;
    }

    return {
      count,
      variant: config.variant,
      label: `${count > 9 ? "9+" : count} ${config.labelSuffix}`,
    };
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-linear-to-tl from-sidebar-primary to-sidebar-primary/70 text-sidebar-primary-foreground shadow-blue-300 shadow-inner">
                  <Atom className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold font-sora text-foreground">
                    Nexus
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Capstone Management System
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <React.Fragment key={item.title}>
                {item.items ? (
                  <>
                    <SidebarGroupLabel className="mt-4">
                      {item.title}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                      {item.items.map((subItem) => (
                        <SidebarSubMenuItem
                          key={subItem.href}
                          subItem={subItem}
                          isActive={isActive}
                          badgeConfig={getBadgeConfig(subItem.href || "")}
                        />
                      ))}
                    </SidebarMenu>
                  </>
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href || "")}
                    >
                      <Link href={item.href || ""}>
                        {item.icon ? (
                          <item.icon
                            className={cn(
                              isActive(item.href || "")
                                ? "text-primary dark:text-blue-500"
                                : null
                            )}
                          />
                        ) : null}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </React.Fragment>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {user ? (
          <NavUser
            user={{
              name: user.name,
              email: user.email,
            }}
          />
        ) : (
          <div className="px-2 py-2 text-muted-foreground text-xs">
            Not logged in
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
