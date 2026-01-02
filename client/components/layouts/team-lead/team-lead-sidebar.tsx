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

type AppSidebarProps = {
  user: User | null;
  badgeCounts?: BadgeCounts;
};

export function AppSidebar({ user, badgeCounts }: AppSidebarProps) {
  const pathname = usePathname();

  // Strip the (auth) route group from pathname
  const cleanPathname = pathname.replace(AUTH_ROUTE_REGEX, "") || "/";

  const isActive = (href: string) => {
    if (href === "#") {
      return false;
    }
    return cleanPathname === href;
  };

  // Badge display helper: hide if 0, show "9+" if > 9
  const _formatBadge = (count: number): string | null => {
    if (count === 0) {
      return null;
    }
    if (count > 9) {
      return "9+";
    }
    return count.toString();
  };

  // Get badge config for each route
  const getBadgeConfig = (href: string) => {
    if (!badgeCounts) {
      return null;
    }

    switch (href) {
      case "/settings/activity-logs":
        if (badgeCounts.todayActivityCount === 0) {
          return null;
        }
        return {
          count: badgeCounts.todayActivityCount,
          variant: "default" as const,
          label: `${badgeCounts.todayActivityCount > 9 ? "9+" : badgeCounts.todayActivityCount} Today`,
        };
      case "/deliverables":
        if (badgeCounts.deliverablesInReview === 0) {
          return null;
        }
        return {
          count: badgeCounts.deliverablesInReview,
          variant: "info" as const, // Blue
          label: `${badgeCounts.deliverablesInReview > 9 ? "9+" : badgeCounts.deliverablesInReview} Review`,
        };
      case "/sprints":
        if (badgeCounts.blockedTasks === 0) {
          return null;
        }
        return {
          count: badgeCounts.blockedTasks,
          variant: "error" as const, // Red
          label: `${badgeCounts.blockedTasks > 9 ? "9+" : badgeCounts.blockedTasks} Blocked`,
        };
      case "/meetings":
        if (badgeCounts.phasesWithoutMeetings === 0) {
          return null;
        }
        return {
          count: badgeCounts.phasesWithoutMeetings,
          variant: "warning" as const, // Amber/Warning
          label: `${badgeCounts.phasesWithoutMeetings > 9 ? "9+" : badgeCounts.phasesWithoutMeetings} Missing`,
        };
      default:
        return null;
    }
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
                      {item.items.map((subItem) => {
                        const badgeConfig = getBadgeConfig(subItem.href || "");
                        return (
                          <SidebarMenuItem key={subItem.href}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive(subItem.href || "")}
                            >
                              <Link href={subItem.href || ""}>
                                {subItem.icon ? (
                                  <subItem.icon
                                    className={cn(
                                      isActive(subItem.href || "")
                                        ? "text-primary dark:text-blue-500"
                                        : null
                                    )}
                                  />
                                ) : null}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuButton>
                            {badgeConfig?.label && (
                              <SidebarMenuBadge className="font-sora text-xs">
                                <Badge variant={badgeConfig.variant}>
                                  {badgeConfig.label}
                                </Badge>
                              </SidebarMenuBadge>
                            )}
                          </SidebarMenuItem>
                        );
                      })}
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
