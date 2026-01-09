import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";
import type { User } from "@/lib/types";
import axios from "axios"; // Ensure axios is imported

export async function getAuthContext(): Promise<{
  user: User;
  token: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";

  // 1. Fast Fail: If no token exists on client, go to login immediately
  if (!token) {
    redirect("/login");
  }

  try {
    // 2. Validate with Backend
    // We fetch the user data. If the signature is wrong, this throws a 401.
    // getCurrentUser now throws on failure instead of returning null
    const user = await getCurrentUser(token);

    return { user, token };
  } catch (error) {
    // 3. Self-Healing Mechanism
    // If Backend rejects the token (401), we assume it's tampered or expired.
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.warn("[Auth] Invalid token signature detected. Redirecting.");
      
      // Critical: Delete the bad cookie to prevent the loop
      // Use try-finally to ensure redirect happens even if cookie deletion fails
      try {
        cookieStore.delete("auth_token");
      } finally {
        redirect("/login");
      }
    }

    // 4. Handle Redirects (Next.js internals)
    // redirect() throws a specific error type that we must NOT catch/block
    if (isRedirectError(error)) {
      throw error;
    }

    // 5. Real Errors (Database down, 500s) -> Go to Error Boundary
    console.error("Auth Context Error:", error);
    throw error;
  }
}

// Helper to identify Next.js redirect errors so we don't block them
function isRedirectError(error: any) {
  return (
    error?.digest?.startsWith("NEXT_REDIRECT") ||
    error?.message?.includes("NEXT_REDIRECT")
  );
}
