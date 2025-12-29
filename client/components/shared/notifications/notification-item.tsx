"use client";

import { useRouter } from "next/navigation";
import { formatRelativeTime } from "@/lib/helpers/format-date";
import type { Notification } from "@/lib/types";
import { cn } from "@/lib/utils";

type NotificationItemProps = {
  notification: Notification;
  isUnread: boolean;
  isPending?: boolean;
  onClick: () => void;
};

/**
 * Single notification item display
 *
 * Shows message, timestamp, unread indicator, and handles click navigation.
 * Uses Next.js router.push for fast client-side navigation.
 * Shows loading state with reduced opacity when marking as read.
 */
export function NotificationItem({
  notification,
  isUnread,
  isPending = false,
  onClick,
}: NotificationItemProps) {
  const router = useRouter();

  const handleClick = () => {
    onClick();

    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <button
      className={cn(
        "w-full rounded-md px-3 py-2 text-left transition-all hover:bg-accent disabled:cursor-wait",
        isUnread ? "bg-accent/50" : "",
        isPending ? "opacity-50" : "opacity-100"
      )}
      disabled={isPending}
      onClick={handleClick}
      type="button"
    >
      <div className="relative flex items-start gap-3">
        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="wrap-break-words text-foreground/90 text-sm">
            {notification.message}
          </p>
          <p className="text-muted-foreground text-xs">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>

        {/* Unread indicator */}
        {isUnread && (
          <div className="mt-1 shrink-0">
            <span className="sr-only">Unread</span>
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        )}
      </div>
    </button>
  );
}
