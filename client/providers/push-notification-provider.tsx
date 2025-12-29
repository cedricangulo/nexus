"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
    registerFirebaseServiceWorker,
    requestNotificationPermission,
    onForegroundMessage,
    isFirebaseConfigured,
} from "@/lib/firebase";
import { registerDeviceToken } from "@/lib/api/device-token";
import { toast } from "sonner";

interface PushNotificationProviderProps {
    children: ReactNode;
}

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
}: PushNotificationProviderProps) {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current || !isFirebaseConfigured()) return;

        async function setupPushNotifications() {
            try {
                // Register the service worker
                const registration = await registerFirebaseServiceWorker();
                if (!registration) return;

                // Request permission and get token
                const token = await requestNotificationPermission();
                if (!token) return;

                // Register with backend
                await registerDeviceToken(token, "web");

                // Handle foreground messages
                onForegroundMessage((payload: unknown) => {
                    const notification = (payload as { notification?: { title?: string; body?: string } })?.notification;
                    if (notification?.title) {
                        toast.info(notification.title, {
                            description: notification.body,
                        });
                    }
                });

                initialized.current = true;
            } catch (error) {
                console.error("Push notification setup failed:", error);
            }
        }

        setupPushNotifications();
    }, []);

    return <>{children}</>;
}
