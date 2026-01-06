"use client";

import { BellIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { markAllAsReadAction, markAsReadAction } from "@/actions/notifications";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Notification } from "@/lib/types";
import { EmptyState } from "../empty-state";
import { NotificationItem } from "./notification-item";

type NotificationListProps = {
  initialNotifications: Notification[];
  initialUnreadCount: number;
};

/**
 * Notification List Component (Popover Content)
 *
 * Features:
 * - Optimistic updates: UI updates immediately when marking as read
 * - Polling: Calls router.refresh() every 60 seconds for fresh data
 * - Deep-linking: Navigates to specific comments with URL anchors
 * - Graceful errors: Shows toast on failure, reverts optimistic state
 *
 * Note: This component is rendered inside PopoverContent in index.tsx
 */
export function NotificationList({
  initialNotifications,
  initialUnreadCount,
}: NotificationListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingNotificationId, setPendingNotificationId] = useState<
    string | null
  >(null);

  // Optimistic state management
  // When user marks as read, UI updates immediately
  // If server fails, automatically reverts
  const [optimisticNotifications, updateOptimistic] = useOptimistic(
    initialNotifications,
    (
      state: Notification[],
      { type, id }: { type: "single" | "all"; id?: string }
    ) => {
      if (type === "all") {
        return state.map((n) => ({ ...n, isRead: true }));
      }
      return state.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    }
  );

  // Calculate unread count from optimistic state
  const unreadCount = optimisticNotifications.filter((n) => !n.isRead).length;

  // Handle mark single notification as read
  const handleMarkAsRead = (notification: Notification) => {
    // Track which notification is being processed
    setPendingNotificationId(notification.id);

    // Server action with optimistic update (in background)
    startTransition(async () => {
      // Optimistic update inside transition
      updateOptimistic({ type: "single", id: notification.id });

      const result = await markAsReadAction(notification.id);

      if (!result.success) {
        toast.error(result.error || "Failed to update notification");
        // Optimistic state automatically reverts on error
      }

      // Clear pending state
      setPendingNotificationId(null);
    });
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    // Server action with optimistic update (in background)
    startTransition(async () => {
      // Optimistic update inside transition
      updateOptimistic({ type: "all" });

      const result = await markAllAsReadAction();

      if (!result.success) {
        toast.error(result.error || "Failed to update notifications");
        // Optimistic state automatically reverts on error
      }
    });
  };

  // Soft-refresh polling: Every 60 seconds, refresh server data
  // router.refresh() re-runs server components without full page reload
  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, 60_000); // 60 seconds

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div>
      {/* Header with title and mark all as read action */}
      <div className="flex items-baseline justify-between gap-4 px-3 py-2">
        <div className="font-semibold text-sm">Notifications</div>
        {unreadCount > 0 && (
          <button
            className="font-medium text-xs hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            onClick={handleMarkAllAsRead}
            type="button"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Separator */}
      <div
        aria-orientation="horizontal"
        className="-mx-1 my-1 h-px bg-border"
        role="separator"
        tabIndex={-1}
      />

      {/* Notifications List */}
      {optimisticNotifications.length === 0 ? (
        <div className="px-3 py-8">
          <EmptyState
            description="You're all caught up!"
            icon={BellIcon}
            title="No notifications yet"
          />
        </div>
      ) : (
        <ScrollArea className="h-96 p-1">
          <div className="space-y-1">
            {optimisticNotifications.map((notification) => (
              <NotificationItem
                isPending={pendingNotificationId === notification.id}
                isUnread={!notification.isRead}
                key={notification.id}
                notification={notification}
                onClick={() => handleMarkAsRead(notification)}
              />
            ))}
          </div>
          <ScrollBar />
        </ScrollArea>
      )}
    </div>
  );
}
