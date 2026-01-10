/**
 * Dynamic Firebase Messaging Service Worker
 *
 * This route serves a dynamically generated Service Worker script
 * with Firebase configuration injected at build/request time.
 *
 * This fixes the "Event handler of 'push' event must be added on the
 * initial evaluation of worker script" error by ensuring Firebase
 * initializes immediately when the script loads.
 */

export async function GET() {
    // Build config object, converting undefined to empty string for JSON safety
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    };

    // Check if Firebase is configured - convert to explicit boolean
    const isConfigured = !!(
        firebaseConfig.apiKey &&
        firebaseConfig.projectId &&
        firebaseConfig.messagingSenderId &&
        firebaseConfig.appId
    );

    const swScript = `// Firebase Messaging Service Worker
// Auto-generated with injected configuration

importScripts("https://www.gstatic.com/firebasejs/11.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.2.0/firebase-messaging-compat.js");

// Firebase config injected at build time
var firebaseConfig = ${JSON.stringify(firebaseConfig)};
var isConfigured = ${isConfigured ? "true" : "false"};

var messaging = null;

// Initialize Firebase immediately on script load
if (isConfigured) {
  try {
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
    console.log("[firebase-messaging-sw.js] Firebase initialized successfully");

    // Handle background messages via Firebase SDK
    messaging.onBackgroundMessage(function(payload) {
      console.log("[firebase-messaging-sw.js] Background message received:", payload);
      
      var notificationTitle = payload.notification && payload.notification.title ? payload.notification.title : "Nexus";
      var notificationOptions = {
        body: payload.notification && payload.notification.body ? payload.notification.body : "You have a new notification",
        icon: "/ui-dark.png",
        badge: "/ui-dark.png",
        tag: payload.data && payload.data.tag ? payload.data.tag : "nexus-notification",
        data: payload.data
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (error) {
    console.error("[firebase-messaging-sw.js] Failed to initialize Firebase:", error);
  }
} else {
  console.warn("[firebase-messaging-sw.js] Firebase not configured - push notifications disabled");
}

// Push event handler - registered at top level for initial evaluation
self.addEventListener("push", function(event) {
  console.log("[firebase-messaging-sw.js] Push event received:", event);

  // If Firebase messaging is initialized, it handles the push via onBackgroundMessage
  // This is a fallback for edge cases
  if (!messaging && event.data) {
    try {
      var payload = event.data.json();
      console.log("[firebase-messaging-sw.js] Push payload (fallback):", payload);

      if (payload.notification) {
        event.waitUntil(
          self.registration.showNotification(
            payload.notification.title || "Nexus",
            {
              body: payload.notification.body || "You have a new notification",
              icon: "/ui-dark.png",
              badge: "/ui-dark.png",
              tag: payload.data && payload.data.tag ? payload.data.tag : "nexus-notification",
              data: payload.data
            }
          )
        );
      }
    } catch (error) {
      console.error("[firebase-messaging-sw.js] Error parsing push data:", error);
    }
  }
});

// Push subscription change handler - registered at top level
self.addEventListener("pushsubscriptionchange", function(event) {
  console.log("[firebase-messaging-sw.js] Push subscription changed:", event);
});

// Notification click handler - registered at top level
self.addEventListener("notificationclick", function(event) {
  console.log("[firebase-messaging-sw.js] Notification click:", event.notification);
  event.notification.close();

  // Get the link from the notification data or default to dashboard
  var link = event.notification.data && event.notification.data.link ? event.notification.data.link : "/dashboard";
  var urlToOpen = new URL(link, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function(windowClients) {
        // Check if there's already a window open
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
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
`;

    return new Response(swScript, {
        headers: {
            "Content-Type": "application/javascript",
            "Service-Worker-Allowed": "/",
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    });
}

