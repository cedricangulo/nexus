"use client";

import { CalendarDays, Home, IterationCcw, Layers, Package} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  ariaLabel: string;
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: <Home className="size-5" />,
    ariaLabel: "Go to home",
  },
  {
    href: "/phases",
    label: "Phases",
    icon: <Layers className="size-5" />,
    ariaLabel: "View phases",
  },
  {
    href: "/deliverables",
    label: "Deliverables",
    icon: <Package className="size-5" />,
    ariaLabel: "View deliverables",
  },
  {
    href: "/sprints",
    label: "Sprints",
    icon: <IterationCcw className="size-5" />,
    ariaLabel: "View sprints",
  },
  {
    href: "/meetings",
    label: "Meetings",
    icon: <CalendarDays className="size-5" />,
    ariaLabel: "View meetings",
  },
];

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

export function MemberMobileNav() {
  const pathname = usePathname();

  // Hide nav on detail pages like /sprints/[id], /deliverables/[id], etc.
  if (isDetailPage(pathname)) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed right-0 bottom-0 left-0 z-40 border-t bg-sidebar md:hidden"
    >
      <div
        className="grid h-16 grid-cols-5 gap-1"
        // style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              aria-label={item.ariaLabel}
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
                {item.icon}
              </div>
              <span className="font-medium text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
