"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { toast } from "sonner";
import { registerDeviceTokenAction } from "@/actions/device-token";
import {
  isFirebaseConfigured,
  onForegroundMessage,
  registerFirebaseServiceWorker,
  requestNotificationPermission,
} from "@/lib/firebase";

/**
 * Provider component that sets up push notifications.
 *
 * Add this to your authenticated layout to enable push notifications.
 * It will:
 * 1. Register the Firebase service worker
 * 2. Request notification permission (browser prompt)
 * 3. Register the FCM token with the backend
 * 4. Show toast notifications for foreground messages
 *
 * If Firebase is not configured, it silently does nothing.
 */
export function PushNotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !isFirebaseConfigured()) {
      return;
    }

    async function setupPushNotifications() {
      try {
        console.log("[Push] Starting setup...");

        // Register the service worker
        const registration = await registerFirebaseServiceWorker();
        if (!registration) {
          console.error("[Push] Service Worker registration failed");
          return;
        }
        console.log("[Push] Service Worker ready");

        // Request permission and get token
        const token = await requestNotificationPermission();
        if (!token) {
          console.warn("[Push] No token obtained (permission denied or error)");
          return;
        }
        console.log("[Push] FCM Token obtained:", token.substring(0, 10) + "...");

        // Register with backend using server action for proper authentication
        const result = await registerDeviceTokenAction(token, "web");
        if (result.success) {
          console.log("[Push] Token successfully registered with backend");
        } else {
          console.error("[Push] Failed to register token with backend:", result.error);
        }

        // Handle foreground messages
        onForegroundMessage((payload: unknown) => {
          console.log("[Push] Foreground message received:", payload);
          const notification = (
            payload as { notification?: { title?: string; body?: string } }
          )?.notification;
          if (notification?.title) {
            toast.info(notification.title, {
              description: notification.body,
            });
          }
        });

        initialized.current = true;
      } catch (error) {
        console.error("[Push] Setup failed:", error);
      }
    }

    setupPushNotifications();
  }, []);

  return <>{children}</>;
}
