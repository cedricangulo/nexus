"use client";

import { useEffect, useRef } from "react";
import { registerDeviceToken } from "@/lib/api/device-token";
import {
  isFirebaseConfigured,
  onForegroundMessage,
  registerFirebaseServiceWorker,
  requestNotificationPermission,
} from "@/lib/firebase";

/**
 * Hook to set up push notifications after login
 *
 * This hook:
 * 1. Registers the Firebase service worker
 * 2. Requests notification permission (if not already granted)
 * 3. Gets the FCM token and registers it with the backend
 * 4. Sets up foreground message handling
 *
 * Call this hook in a component that's rendered after login (e.g., Dashboard layout)
 */
export function usePushNotifications() {
  const initialized = useRef(false);

  useEffect(() => {
    // Skip if already initialized or Firebase not configured
    if (initialized.current || !isFirebaseConfigured()) {
      return;
    }

    async function setupPushNotifications() {
      try {
        // Register the service worker first
        const registration = await registerFirebaseServiceWorker();
        if (!registration) {
          console.log("Push notifications not available");
          return;
        }

        // Request permission and get token
        const token = await requestNotificationPermission();
        if (!token) {
          console.log("Notification permission denied or token unavailable");
          return;
        }

        // Register the token with backend
        await registerDeviceToken(token, "web");
        console.log("Push notification token registered");

        // Set up foreground message handler
        onForegroundMessage((payload) => {
          // You can show a toast notification here
          console.log("Foreground notification:", payload);
        });

        initialized.current = true;
      } catch (error) {
        console.error("Failed to set up push notifications:", error);
      }
    }

    setupPushNotifications();
  }, []);
}
