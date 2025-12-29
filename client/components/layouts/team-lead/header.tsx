"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Project } from "@/lib/types";

// Centralized route-to-title mapping (excludes /dashboard which gets project name)
const ROUTE_TITLES: Record<string, string> = {
  "/phases": "Project Phases",
  "/sprints": "Sprints",
  "/deliverables": "Deliverables",
  "/meetings": "Meeting Minutes",
  "/settings/team-members": "Team Members",
  "/settings/project-config": "Project Configuration",
  "/settings/backup": "Backup & Export",
  "/settings/activity-logs": "Activity Logs",
};

function getPageTitle(pathname: string): string | undefined {
  // Check for exact match first
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname];
  }

  // Check for sprint detail page pattern
  if (pathname.startsWith("/sprints/") && pathname !== "/sprints") {
    return "Sprint Details";
  }

  // Check for deliverable detail page pattern
  if (pathname.startsWith("/deliverables/") && pathname !== "/deliverables") {
    return "Deliverable Details";
  }

  return;
}

/**
 * App Header Component
 * Provides main navigation header with sidebar toggle, search, notifications, and user avatar
 * Title updates dynamically based on current route - shows project name on dashboard
 */
export function AppHeader({
  project,
  notificationComponent,
}: {
  project: Project | null;
  notificationComponent: React.ReactNode;
}) {
  const pathname = usePathname();

  // For dashboard, show project name; for other routes, use mapping
  let title: string | undefined;
  if (pathname === "/dashboard") {
    title = project?.name;
  } else {
    title = getPageTitle(pathname);
  }
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-sidebar/60 backdrop-blur-2xl">
      <div className="flex items-center gap-2 px-3">
        <SidebarTrigger
          aria-label="Toggle sidebar navigation"
          className="rounded-md transition-colors hover:bg-accent"
        />
        <Separator aria-hidden="true" className="h-4" orientation="vertical" />
        {title ? (
          <h1 className="font-medium text-muted-foreground text-sm md:text-lg">
            {title}
          </h1>
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 px-4 md:gap-6">
        <div className="hidden w-full max-w-xs items-center gap-2 md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search" className="pl-9" placeholder="Search" />
          </div>
        </div>
        {notificationComponent}
        <ThemeToggle />
      </div>
    </header>
  );
}
