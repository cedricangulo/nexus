/**
 * Firebase Messaging Service Worker
 *
 * This service worker handles push notifications when the app is in the background.
 * Firebase config is received via postMessage from the main app.
 */

// Import Firebase scripts (using compat versions for service worker)
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

let messaging = null;

// Listen for config message from main app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG") {
    initializeFirebase(event.data.config);
  }
});

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

    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log(
        "[firebase-messaging-sw.js] Background message received:",
        payload
      );

      const notificationTitle = payload.notification?.title || "Nexus";
      const notificationOptions = {
        body: payload.notification?.body || "You have a new notification",
        icon: "/ui-dark.png",
        badge: "/ui-dark.png",
        tag: payload.data?.tag || "nexus-notification",
        data: payload.data,
      };

      self.registration.showNotification(
        notificationTitle,
        notificationOptions
      );
    });
  } catch (error) {
    console.error("[firebase-messaging-sw.js] Failed to initialize:", error);
  }
}

// Handle notification click
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
