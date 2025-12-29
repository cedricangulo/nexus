/**
 * Firebase Client Configuration
 * 
 * This module initializes Firebase for web push notifications.
 * The service worker must be registered separately.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Check if Firebase is configured (all required env vars present)
 */
export function isFirebaseConfigured(): boolean {
    return !!(
        firebaseConfig.apiKey &&
        firebaseConfig.projectId &&
        firebaseConfig.messagingSenderId &&
        firebaseConfig.appId
    );
}

/**
 * Initialize Firebase app (singleton pattern)
 */
export function getFirebaseApp(): FirebaseApp | null {
    if (!isFirebaseConfigured()) {
        console.warn("Firebase not configured - push notifications disabled");
        return null;
    }

    if (firebaseApp) return firebaseApp;

    const apps = getApps();
    if (apps.length > 0) {
        firebaseApp = apps[0];
    } else {
        firebaseApp = initializeApp(firebaseConfig);
    }

    return firebaseApp;
}

/**
 * Get Firebase Messaging instance
 * Only works in browser with service worker support
 */
export function getFirebaseMessaging(): Messaging | null {
    if (typeof window === "undefined") return null;
    if (!("serviceWorker" in navigator)) return null;

    const app = getFirebaseApp();
    if (!app) return null;

    if (messaging) return messaging;

    try {
        messaging = getMessaging(app);
        return messaging;
    } catch (error) {
        console.error("Failed to initialize Firebase Messaging:", error);
        return null;
    }
}

/**
 * Request notification permission and get FCM token
 * Returns null if permission denied or not supported
 */
export async function requestNotificationPermission(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    if (!("Notification" in window)) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        console.log("Notification permission denied");
        return null;
    }

    return getFCMToken();
}

/**
 * Get the current FCM token (requires permission already granted)
 */
export async function getFCMToken(): Promise<string | null> {
    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    try {
        // Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        return token;
    } catch (error) {
        console.error("Failed to get FCM token:", error);
        return null;
    }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback: (payload: unknown) => void): (() => void) | null {
    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        callback(payload);
    });

    return unsubscribe;
}

/**
 * Register the Firebase service worker and send it the config
 * Call this once on app initialization
 */
export async function registerFirebaseServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === "undefined") return null;
    if (!("serviceWorker" in navigator)) return null;
    if (!isFirebaseConfigured()) return null;

    try {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("Firebase SW registered:", registration.scope);

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;

        // Send the config to the service worker
        if (registration.active) {
            registration.active.postMessage({
                type: "FIREBASE_CONFIG",
                config: firebaseConfig,
            });
        }

        return registration;
    } catch (error) {
        console.error("Failed to register Firebase SW:", error);
        return null;
    }
}
