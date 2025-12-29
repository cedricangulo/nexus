import { BellIcon } from "lucide-react";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { getNotifications } from "@/lib/data/notifications";
import { NotificationList } from "./notification-list";

/**
 * Notification Component (Server Component)
 *
 * Fetches initial notifications and passes to client component for interactivity.
 * The button (trigger) is always visible. Only the popover content streams data via Suspense.
 *
 * @module components/shared/notifications
 */

async function NotificationContent() {
  const notifications = await getNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationList
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    />
  );
}

function NotificationSkeleton() {
  return (
    <div className="space-y-2 p-3">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function Notification() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Open notifications"
          className="relative"
          size="icon"
          variant="outline"
        >
          <BellIcon aria-hidden="true" size={16} />
          <Suspense>
            <NotificationBadge />
          </Suspense>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Suspense fallback={<NotificationSkeleton />}>
          <NotificationContent />
        </Suspense>
      </PopoverContent>
    </Popover>
  );
}

async function NotificationBadge() {
  const notifications = await getNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Badge className="absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1">
      {unreadCount > 99 ? "99+" : unreadCount}
    </Badge>
  );
}
