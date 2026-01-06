"server-only";

import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

export type AppRole = "member" | "teamLead" | "adviser";

export type SessionUser = {
  id?: string;
  email?: string;
  name?: string;
  role: AppRole;
};

export type Session = {
  user: SessionUser;
  token: string;
};

function normalizeRole(rawRole: unknown): AppRole {
  if (typeof rawRole !== "string") {
    return "member";
  }

  const value = rawRole.trim().toLowerCase();

  if (value === "adviser") {
    return "adviser";
  }

  // Accept common variants.
  if (
    value === "team_lead" ||
    value === "team-lead" ||
    value === "teamlead" ||
    value === "team lead" ||
    value === "teamlead/project manager"
  ) {
    return "teamLead";
  }

  if (
    value === "member" ||
    value === "team_member" ||
    value === "team-member"
  ) {
    return "member";
  }

  return "member";
}

function decodeToken(token: string): SessionUser | null {
  try {
    const payload = decodeJwt(token) as Record<string, unknown>;

    return {
      id: typeof payload.id === "string" ? payload.id : undefined,
      email: typeof payload.email === "string" ? payload.email : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined,
      role: normalizeRole(payload.role),
    };
  } catch {
    return null;
  }
}

/**
 * Instant auth() function using JWT decoding only
 *
 * This function decodes the JWT token stored in cookies without making
 * any network requests. This allows the page to render the static shell
 * instantly without being blocked by network I/O.
 *
 * The JWT contains: id, email, name, role - sufficient for role-based routing.
 *
 * If components need fresh/updated user data from the database, they should:
 * 1. Call getAuthContext() to get the token
 * 2. Pass the token to getCurrentUser(token)
 * 3. Wrap that call in <Suspense> boundary
 */
export const auth = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  // Decode the JWT token instantly - no network call
  const decoded = decodeToken(token);

  if (!decoded) {
    return null;
  }

  return {
    token,
    user: decoded,
  };
});

export const authRole = {
  normalize: normalizeRole,
};
