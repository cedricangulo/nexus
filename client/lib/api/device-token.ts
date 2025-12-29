import { API_ENDPOINTS } from "./endpoints";
import { createApiClient } from "./client";

export interface DeviceTokenResponse {
    success: boolean;
    data?: {
        id: string;
        token: string;
        platform: string;
    };
    message?: string;
}

/**
 * Register a device token for push notifications
 */
export async function registerDeviceToken(
    token: string,
    platform: "web" | "android" | "ios" = "web"
): Promise<DeviceTokenResponse> {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.DEVICE_TOKENS.REGISTER, {
        token,
        platform,
    });
    return response.data as DeviceTokenResponse;
}

/**
 * Unregister a device token
 */
export async function unregisterDeviceToken(
    token: string
): Promise<DeviceTokenResponse> {
    const client = await createApiClient();
    const response = await client.delete(
        API_ENDPOINTS.DEVICE_TOKENS.UNREGISTER(token)
    );
    return response.data as DeviceTokenResponse;
}
