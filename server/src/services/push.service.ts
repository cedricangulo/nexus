import admin from "firebase-admin";
import { env } from "../config/env.js";
import { getDeviceTokensByUserId, deleteTokensByValues } from "../modules/device-token/device-token.service.js";
import logger from "../utils/logger.js";

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null;

function getFirebaseApp(): admin.app.App | null {
    if (firebaseApp) return firebaseApp;

    // Check if Firebase credentials are configured
    if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
        logger.warn("Firebase credentials not configured - push notifications disabled");
        return null;
    }

    try {
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: env.FIREBASE_PROJECT_ID,
                clientEmail: env.FIREBASE_CLIENT_EMAIL,
                privateKey: env.FIREBASE_PRIVATE_KEY,
            }),
        });
        logger.info("Firebase Admin SDK initialized");
        return firebaseApp;
    } catch (error) {
        logger.error({ error }, "Failed to initialize Firebase Admin SDK");
        return null;
    }
}

interface PushNotificationOptions {
    title: string;
    body: string;
    link?: string;
    data?: Record<string, string>;
}

// FCM error codes that indicate a token should be removed
const INVALID_TOKEN_ERRORS = [
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered",
];

/**
 * Send push notification to a specific user's devices
 */
export async function sendPushToUser(
    userId: string,
    options: PushNotificationOptions
): Promise<void> {
    const app = getFirebaseApp();
    if (!app) {
        logger.debug({ userId }, "Push skipped - Firebase not configured");
        return;
    }

    const deviceTokens = await getDeviceTokensByUserId(userId);
    if (deviceTokens.length === 0) {
        logger.debug({ userId }, "No device tokens found for user");
        return;
    }

    const tokens = deviceTokens.map((dt) => dt.token);

    const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
            title: options.title,
            body: options.body,
        },
        webpush: {
            fcmOptions: {
                link: options.link,
            },
        },
        // Include link in data for Service Worker access in all states
        data: {
            ...options.data,
            link: options.link || "/dashboard",
        },
    };

    try {
        const response = await admin.messaging(app).sendEachForMulticast(message);

        logger.info(
            { userId, successCount: response.successCount, failureCount: response.failureCount },
            "Push notifications sent"
        );

        // Handle failed tokens (e.g., expired or invalid)
        if (response.failureCount > 0) {
            const tokensToRemove: string[] = [];

            response.responses.forEach((resp, idx) => {
                if (!resp.success && resp.error) {
                    const errorCode = resp.error.code;

                    // Remove tokens that are invalid or unregistered
                    if (INVALID_TOKEN_ERRORS.includes(errorCode)) {
                        tokensToRemove.push(tokens[idx]);
                        logger.info({ token: tokens[idx], errorCode }, "Removing invalid device token");
                    } else {
                        logger.warn({ token: tokens[idx], errorCode }, "Push notification failed for token");
                    }
                }
            });

            // Clean up invalid tokens from database
            if (tokensToRemove.length > 0) {
                await deleteTokensByValues(tokensToRemove);
                logger.info({ count: tokensToRemove.length }, "Removed invalid device tokens");
            }
        }
    } catch (error) {
        logger.error({ error, userId }, "Failed to send push notifications");
    }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(
    userIds: string[],
    options: PushNotificationOptions
): Promise<void> {
    await Promise.all(userIds.map((userId) => sendPushToUser(userId, options)));
}
