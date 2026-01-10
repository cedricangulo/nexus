/**
 * Firebase Messaging Service Worker
 *
 * This service worker handles push notifications when the app is in the background.
 * Firebase config is received via postMessage from the main app.
 *
 * IMPORTANT: Event handlers for 'push', 'pushsubscriptionchange', and 'notificationclick'
 * must be registered at the top level (initial evaluation) of the service worker script.
 */

// Import Firebase scripts (using compat versions for service worker)
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

let messaging = null;
let pendingPayloads = [];

/**
 * Initialize Firebase with the provided config
 */
function initializeFirebase(config) {
  if (messaging) {
    return; // Already initialized
  }

  if (!(config?.apiKey && config.projectId)) {
    console.warn("[firebase-messaging-sw.js] Invalid config received");
    return;
  }

  try {
    firebase.initializeApp(config);
    messaging = firebase.messaging();
    console.log("[firebase-messaging-sw.js] Firebase initialized");

    // Process any pending payloads that arrived before initialization
    pendingPayloads.forEach((payload) => {
      showNotification(payload);
    });
    pendingPayloads = [];

    // Handle background messages via Firebase SDK
    messaging.onBackgroundMessage((payload) => {
      console.log(
        "[firebase-messaging-sw.js] Background message received:",
        payload
      );
      showNotification(payload);
    });
  } catch (error) {
    console.error("[firebase-messaging-sw.js] Failed to initialize:", error);
  }
}

/**
 * Display a notification from the payload
 */
function showNotification(payload) {
  const notificationTitle = payload.notification?.title || "Nexus";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/ui-dark.png",
    badge: "/ui-dark.png",
    tag: payload.data?.tag || "nexus-notification",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}

// Listen for config message from main app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG") {
    initializeFirebase(event.data.config);
  }
});

/**
 * Push event handler - MUST be registered at top level
 * This handles push events when Firebase SDK hasn't initialized yet
 */
self.addEventListener("push", (event) => {
  console.log("[firebase-messaging-sw.js] Push event received:", event);

  // If Firebase messaging is initialized, it will handle the push via onBackgroundMessage
  // This handler is a fallback for when the push arrives before initialization
  if (!messaging && event.data) {
    try {
      const payload = event.data.json();
      console.log(
        "[firebase-messaging-sw.js] Push payload (pre-init):",
        payload
      );

      // Queue the payload for later or show immediately
      if (payload.notification) {
        event.waitUntil(
          self.registration.showNotification(
            payload.notification.title || "Nexus",
            {
              body:
                payload.notification.body || "You have a new notification",
              icon: "/ui-dark.png",
              badge: "/ui-dark.png",
              tag: payload.data?.tag || "nexus-notification",
              data: payload.data,
            }
          )
        );
      }
    } catch (error) {
      console.error("[firebase-messaging-sw.js] Error parsing push data:", error);
    }
  }
});

/**
 * Push subscription change handler - MUST be registered at top level
 */
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log(
    "[firebase-messaging-sw.js] Push subscription changed:",
    event
  );
  // Firebase SDK handles re-subscription automatically when initialized
});

/**
 * Notification click handler - MUST be registered at top level
 */
self.addEventListener("notificationclick", (event) => {
  console.log(
    "[firebase-messaging-sw.js] Notification click:",
    event.notification
  );
  event.notification.close();

  // Get the link from the notification data or default to home
  const link = event.notification.data?.link || "/";
  const urlToOpen = new URL(link, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Open a new window if not
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
