import { createClientSideApiClient } from "./client-side";
import { API_ENDPOINTS } from "./endpoints";

export type DeviceTokenResponse = {
  success: boolean;
  data?: {
    id: string;
    token: string;
    platform: string;
  };
  message?: string;
};

// Use client-side API since these functions are called from client components
const getApiClient = () => createClientSideApiClient();

/**
 * Register a device token for push notifications
 */
export async function registerDeviceToken(
  token: string,
  platform: "web" | "android" | "ios" = "web"
): Promise<DeviceTokenResponse> {
  const apiClient = getApiClient();
  const response = await apiClient.post(API_ENDPOINTS.DEVICE_TOKENS.REGISTER, {
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
  const apiClient = getApiClient();
  const response = await apiClient.delete(
    API_ENDPOINTS.DEVICE_TOKENS.UNREGISTER(token)
  );
  return response.data as DeviceTokenResponse;
}
