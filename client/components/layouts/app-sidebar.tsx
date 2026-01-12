"use client";

import { Atom } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NAV_CONFIG, type NavItem, type Role } from "@/lib/config/nav";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NavUser } from "./nav-user";

const AUTH_ROUTE_REGEX = /^\/(auth)/;

type SidebarNavItemProps = {
  item: NavItem;
  isActive: boolean;
  badgeSlot?: ReactNode;
};

function SidebarNavItem({ item, isActive, badgeSlot }: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.href} prefetch>
          <Icon className={cn(isActive && "text-primary dark:text-blue-500")} />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {badgeSlot}
    </SidebarMenuItem>
  );
}

type AppSidebarProps = {
  user: User | null;
  badges?: Record<string, ReactNode>;
};

export function AppSidebar({ user, badges = {} }: AppSidebarProps) {
  const pathname = usePathname();

  // Strip the (auth) route group from pathname for matching
  const cleanPathname = pathname.replace(AUTH_ROUTE_REGEX, "") || "/";

  const isActive = (href: string) => {
    if (href === "#") return false;
    // Exact match for dashboard, startsWith for other routes
    if (href === "/dashboard") return cleanPathname === href;
    return cleanPathname.startsWith(href);
  };

  // Get nav groups for user's role
  const userRole = (user?.role || "MEMBER") as Role;
  const navGroups = NAV_CONFIG[userRole] || NAV_CONFIG.MEMBER;

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Header: Logo */}
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

      {/* Content: Navigation Groups */}
      <SidebarContent>
        {navGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.label || `group-${groupIndex}`}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  badgeSlot={badges[item.href]}
                  isActive={isActive(item.href)}
                  item={item}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer: User Menu */}
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
