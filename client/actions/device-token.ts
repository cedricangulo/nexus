"use server";

import { createApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ServerActionResponse } from "@/lib/types";

export interface DeviceTokenActionResponse extends ServerActionResponse {
  data?: {
    id: string;
  };
}

/**
 * Server action to register a device token for push notifications.
 * This runs on the server and has access to authenticated cookies.
 */
export async function registerDeviceTokenAction(
  token: string,
  platform: "web" | "android" | "ios" = "web"
): Promise<DeviceTokenActionResponse> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  console.log(`[Server Action] Registering token at ${API_URL}`);

  try {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.DEVICE_TOKENS.REGISTER, {
      token,
      platform,
    });

    return {
      success: true,
      data: response.data?.data,
    };
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || error.message || "Unknown error";
    console.error(`[Server Action] Registration failed: ${errorMsg}`, {
      status: error.response?.status,
      url: error.config?.url,
      stack: error.stack
    });

    return {
      success: false,
      error: `Failed to register push notification token: ${errorMsg} (URL: ${API_URL})`,
    };
  }
}

/**
 * Server action to unregister a device token.
 */
export async function unregisterDeviceTokenAction(
  token: string
): Promise<DeviceTokenActionResponse> {
  try {
    const client = await createApiClient();
    const response = await client.delete(
      API_ENDPOINTS.DEVICE_TOKENS.UNREGISTER(token)
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to unregister device token via server action:", error);
    return {
      success: false,
      error: "Failed to unregister push notification token",
    };
  }
}
