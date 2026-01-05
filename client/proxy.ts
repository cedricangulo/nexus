import { type NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // When your token expired (after 1 hour):
  // Browser: "I have a token!" (It's an old, expired cookie, but it exists).
  // Proxy: "I see a token! Go to Dashboard."
  // Dashboard: Checks token with backend -> 401 Unauthorized (Expired).
  // App Logic: "401 means you need to login. Go to /login."
  // Proxy: "I see a token! Go to Dashboard." -> LOOP.

  // 1. Check if user is trying to access /login
  if (pathname === "/login" && token) {
    try {
      // 2. Decode the token to check expiration
      const payload = decodeJwt(token);
      
      // 3. Check if 'exp' (expiration time) is in the past
      // 'exp' is in seconds, Date.now() is in ms
      if (payload.exp && payload.exp * 1000 > Date.now()) {
        // Token is valid and NOT expired -> Redirect to Dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      // If code reaches here, token is expired. Allow access to /login.
    } catch (e) {
      // Token is malformed. Allow access to /login.
    }
  }

  // 4. Standard Proxy Logic
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
