"server-only";

import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

import { createApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

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

// Wrap auth() with React cache() to deduplicate requests within the same render pass
export const auth = cache(async (): Promise<Session | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.AUTH.ME);

    const me = response.data as {
      id?: string;
      email?: string;
      name?: string;
      role?: string;
    };

    const normalizedRole = normalizeRole(me.role);

    return {
      token,
      user: {
        id: me.id,
        email: me.email,
        name: me.name,
        role: normalizedRole,
      },
    };
  } catch {
    // Fall back to decoding the token so role-based routing still works
    // even if /auth/me is temporarily unavailable.
    const decoded = decodeToken(token);

    if (!decoded) {
      return null;
    }

    return {
      token,
      user: decoded,
    };
  }
});

export const authRole = {
  normalize: normalizeRole,
};
