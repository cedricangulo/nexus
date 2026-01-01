"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GlobalSearch } from "@/components/search/global-search";
import { SearchTrigger } from "@/components/search/search-trigger";
import { ThemeToggle } from "@/components/shared/theme-toggle";
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

  // Check for phase detail page pattern
  if (pathname.startsWith("/phases/") && pathname !== "/phases") {
    return "Phase Details";
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
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

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
        <div className="w-fit max-w-xs items-center gap-2 sm:w-full md:flex">
          <SearchTrigger onOpenSearch={() => setSearchOpen(true)} />
        </div>
        {notificationComponent}
        <ThemeToggle />
      </div>

      <GlobalSearch onOpenChange={setSearchOpen} open={searchOpen} />
    </header>
  );
}
