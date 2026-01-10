"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();

  // Clear the cookie with the same path that was used to set it
  // This ensures the browser properly removes it
  cookieStore.set("auth_token", "", {
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    // Only use secure in actual production deployment (Vercel), not local builds
    secure: process.env.NODE_ENV === "production" && !!process.env.VERCEL,
  });

  // Then perform the standard delete as backup
  cookieStore.delete("auth_token");

  redirect("/login");
}
