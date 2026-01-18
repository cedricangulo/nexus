"use client";

import { LogOutIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTransition } from "react";
import { logoutAction } from "@/actions/logout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/types";
import { getInitials } from "@/lib/utils";

/**
 * User Menu Component
 * Displays user avatar and provides logout functionality.
 * Designed for mobile view in the AppHeader.
 */
export function UserMenu({ user }: { user: User | null }) {
  if (!user) {
    return null;
  }

  const { setTheme, theme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div className="md:hidden">
      {/* Mobile only */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-full" size="icon" variant="outline">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-semibold text-sm">{user.name}</h4>
              <p className="truncate text-muted-foreground text-xs">
                {user.email}
              </p>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setTheme(theme === "light" ? "dark" : "light");
            }}
          >
            {theme === "light" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
            <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem disabled={isPending} onClick={handleLogout}>
            <LogOutIcon size={16} />
            {isPending ? "Logging out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
