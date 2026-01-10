"use server";

import type { AxiosError } from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  type AuthError,
  AuthErrorCode,
  createAuthError,
} from "@/lib/helpers/auth-errors";
import type { ServerActionResponse } from "@/lib/types";

const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionResponse extends ServerActionResponse {
  authError?: AuthError;
}

export async function loginAction(
  input: unknown
): Promise<LoginActionResponse> {
  const parsed = loginInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.AUTH.LOGIN, parsed.data);

    const data = response.data as { token?: string; user?: unknown };

    if (!data.token) {
      console.error("No token in response:", data);
      return {
        success: false,
        error: "Login failed - no token received",
        authError: {
          code: AuthErrorCode.SERVER_ERROR,
          message:
            "Something went wrong on our end. Please try again in a few moments.",
        },
      };
    }

    const cookieStore = await cookies();

    cookieStore.delete("auth_token");

    cookieStore.set("auth_token", data.token, {
      httpOnly: true,
      sameSite: "lax",
      // Only use secure in actual production deployment (Vercel), not local builds
      secure: process.env.NODE_ENV === "production" && !!process.env.VERCEL,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    redirect("/dashboard");
  } catch (error) {
    // Re-throw Next.js redirect errors so they can be handled properly
    // In Next.js 15+, redirect() throws with digest starting with "NEXT_REDIRECT"
    const errorDigest = (error as { digest?: string })?.digest;
    if (errorDigest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Login error:", error);

    // Create structured auth error
    const authError = createAuthError(error);

    // Check for specific axios error patterns
    const axiosError = error as AxiosError<{ message?: string }>;

    // Handle specific error responses from the server
    if (axiosError.response?.data?.message) {
      const serverMessage = axiosError.response.data.message.toLowerCase();

      // Check for account deactivation
      if (
        serverMessage.includes("deactivated") ||
        serverMessage.includes("inactive")
      ) {
        return {
          success: false,
          error: authError.message,
          authError: {
            code: AuthErrorCode.ACCOUNT_INACTIVE,
            message:
              "Your account has been deactivated. Please contact your team lead for assistance.",
          },
        };
      }
    }

    return {
      success: false,
      error: authError.message,
      authError,
    };
  }
}
