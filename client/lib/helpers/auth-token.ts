import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/data/user";
import { requireUser } from "@/lib/helpers/rbac";
import type { User } from "@/lib/types";

export async function getAuthContext(): Promise<{
  user: User;
  token: string;
}> {
  // Validate authentication first
  await requireUser();

  // Extract token
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";

  // Fetch full user data using token
  const user = await getCurrentUser(token);

  if (!user) {
    throw new Error("Failed to fetch user data");
  }

  return { user, token };
}
