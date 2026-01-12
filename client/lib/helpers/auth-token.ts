import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";
import type { User } from "@/lib/types";
import axios from "axios";

export const getAuthContext = cache(async (): Promise<{
  user: User;
  token: string;
}> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";

  if (!token) {
    redirect("/login");
  }

  try {
    const user = await getCurrentUser(token);
    return { user, token };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.warn("[Auth] Invalid token signature detected. Redirecting.");
      try {
        cookieStore.delete("auth_token");
      } finally {
        redirect("/login");
      }
    }

    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Auth Context Error:", error);
    throw error;
  }
});

function isRedirectError(error: any) {
  return (
    error?.digest?.startsWith("NEXT_REDIRECT") ||
    error?.message?.includes("NEXT_REDIRECT")
  );
}
