"use client";

import {
  Atom,
  CalendarDays,
  IterationCcw,
  Layers,
  LayoutDashboard,
  type LucideIcon,
  Package,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BadgeCounts } from "@/lib/data/badge-counts";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NavUser } from "../nav-user";

type NavItem = {
  title: string;
  href?: string;
  icon?: LucideIcon;
  items?: NavItem[];
  tooltip?: string;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    tooltip: "Dashboard",
  },
  { title: "Phases", href: "/phases", icon: Layers, tooltip: "Phases" },
  {
    title: "Deliverables",
    href: "/deliverables",
    icon: Package,
    tooltip: "Deliverables",
  },
  {
    title: "Sprints",
    href: "/sprints",
    icon: IterationCcw,
    tooltip: "Sprints",
  },
  {
    title: "Meetings",
    href: "/meetings",
    icon: CalendarDays,
    tooltip: "Meetings",
  },
] as const;

const AUTH_ROUTE_REGEX = /^\/(auth)/;

type NavItemProps = {
  item: {
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

function SidebarNavMenuItem({ item, isActive, badgeConfig }: NavItemProps) {
  const href = item.href || "";
  const active = isActive(href);
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active}>
        <Link href={href}>
          {Icon && (
            <Icon className={cn(active && "text-primary dark:text-blue-500")} />
          )}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {badgeConfig?.label && (
        <SidebarMenuBadge>
          <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

const BADGE_CONFIG: Record<
  string,
  {
    countKey: keyof BadgeCounts;
    variant: "default" | "info" | "error" | "warning";
    labelSuffix: string;
  }
> = {
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

type AppSidebarProps = {
  user: User | null;
  badgeCounts?: BadgeCounts;
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

  const isMobile = useIsMobile();

  if (isMobile) {
    return null;
  }

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
              <SidebarNavMenuItem
                key={item.title}
                item={item}
                isActive={isActive}
                badgeConfig={getBadgeConfig(item.href || "")}
              />
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
