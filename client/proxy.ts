import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

// Define protected routes that require valid authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/phases",
  "/sprints",
  "/tasks",
  "/deliverables",
  "/analytics",
  "/team",
  "/settings",
];

// Check if path starts with any protected route
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

// Validate token: Check expiration AND signature
async function isTokenValid(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // FAIL CLOSED: No secret means no validation possible
      return false;
    }

    // Verify signature AND expiration with clock tolerance
    const encoder = new TextEncoder();
    await jwtVerify(token, encoder.encode(secret), {
      clockTolerance: 60, // 60 second tolerance for clock skew
    });
    return true;
  } catch {
    // Token is malformed, signature invalid, or expired
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // 1. User trying to access /login with a token
  if (pathname === "/login" && token) {
    if (await isTokenValid(token)) {
      // Valid token -> Redirect to Dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Expired or invalid token -> Clear cookie and allow login
    const response = NextResponse.next();
    response.cookies.delete("auth_token");
    return response;
  }

  // 2. User trying to access protected route
  if (isProtectedRoute(pathname)) {
    if (!token) {
      // No token -> Redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!(await isTokenValid(token))) {
      // Expired, invalid signature, or malformed token -> Clear cookie and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }

    // Valid token -> Allow access
  }

  // 3. Public routes or valid authenticated access
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json).*)",
  ],
};
