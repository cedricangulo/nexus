"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_CONFIG, type Role } from "@/lib/config/nav";
import { useAuthContext } from "@/providers/auth-context-provider";
import { cn } from "@/lib/utils";

/**
 * Detects if the current pathname is a detail page
 * Detail pages have the pattern: /resource/[id]
 * List pages have the pattern: /resource
 */
function isDetailPage(pathname: string): boolean {
  // Remove leading/trailing slashes and split
  const segments = pathname.split("/").filter(Boolean);

  // Detail pages have more than 1 segment (e.g., ['sprints', 'id-123'])
  return segments.length > 1;
}

/**
 * Mobile bottom navigation bar
 * Uses NAV_CONFIG as single source of truth for navigation items
 * Shows only the first 5 items to fit mobile layout
 */
export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  // Hide nav on detail pages like /sprints/[id], /deliverables/[id], etc.
  if (isDetailPage(pathname)) {
    return null;
  }

  // Get nav items from config based on user role
  const userRole = (user?.role || "MEMBER") as Role;
  const navGroups = NAV_CONFIG[userRole] || NAV_CONFIG.MEMBER;

  // Flatten all groups and take first 5 items for mobile nav
  const navItems = navGroups.flatMap((group) => group.items).slice(0, 5);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed right-0 bottom-0 left-0 z-40 border-t bg-sidebar md:hidden"
    >
      <div className="grid h-16 grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              aria-label={`Go to ${item.title}`}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 transition-all duration-200 ease-in-out active:scale-95",
                isActive
                  ? "font-medium text-sidebar-primary"
                  : "text-muted-foreground/80 hover:text-sidebar-primary"
              )}
              href={item.href}
              key={item.href}
            >
              <div
                className={cn(
                  "rounded-sm px-2 py-0.5 transition-all duration-200",
                  isActive && "scale-110 bg-sidebar-accent drop-shadow-sm"
                )}
              >
                <Icon className="size-5" />
              </div>
              <span className="font-medium text-[10px]">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
