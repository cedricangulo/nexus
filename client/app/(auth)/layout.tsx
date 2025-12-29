import { unauthorized } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { PushNotificationProvider } from "@/providers/push-notification-provider";

export default async function AuthLayout({
  children,
  member,
  "team-lead": teamLead,
  adviser,
}: {
  children: ReactNode;
  member: ReactNode;
  "team-lead": ReactNode;
  adviser: ReactNode;
}) {
  const session = await auth();

  // 1. Session Protection - Redirect unauthorized users
  if (!session?.user) {
    unauthorized();
  }

  const currentRole = session.user.role;

  // 2. Select the correct slot based on Role
  let roleSlot: ReactNode;

  switch (currentRole) {
    case "member":
      roleSlot = member;
      break;
    case "teamLead":
      roleSlot = teamLead;
      break;
    case "adviser":
      roleSlot = adviser;
      break;
    default:
      unauthorized();
  }

  return (
    <PushNotificationProvider>
      {/* 3. Render children so Next.js can manage route states and sub-routes */}
      {children}
      {/* 4. Render the role-specific dashboard/UI */}
      {roleSlot}
    </PushNotificationProvider>
  );
}

