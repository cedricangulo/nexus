"server-only";

import { jwtVerify } from "jose";
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

/**
 * Verifies JWT signature and decodes the token
 * SECURITY: Always validates signature before trusting claims
 */
async function verifyToken(token: string): Promise<SessionUser | null> {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    // FAIL CLOSED: No secret means no verification possible
    console.error("[Auth] JWT_SECRET not configured - rejecting session");
    return null;
  }

  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder.encode(secret), {
      clockTolerance: 60, // 60 second tolerance for clock skew
    });

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
 * Secure auth() function with JWT signature verification
 *
 * This function verifies the JWT token signature before trusting claims.
 * The JWT contains: id, email, name, role - sufficient for role-based routing.
 *
 * SECURITY: Uses jwtVerify to validate signature, not just decode.
 * This prevents attackers from forging tokens with elevated privileges.
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

  // SECURITY: Verify JWT signature before trusting claims
  const verified = await verifyToken(token);

  if (!verified) {
    return null;
  }

  return {
    token,
    user: verified,
  };
});

export const authRole = {
  normalize: normalizeRole,
};
