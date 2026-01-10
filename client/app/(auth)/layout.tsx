import { forbidden, unauthorized } from "next/navigation";
import { Suspense } from "react";
import { AuthLoadingFallback } from "@/components/layouts/loading";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { AuthContextProvider } from "@/providers/auth-context-provider";
import { PushNotificationProvider } from "@/providers/push-notification-provider";

export default function AuthLayout({
  children,
  member,
  "team-lead": teamLead,
  adviser,
}: {
  children: React.ReactNode;
  member: React.ReactNode;
  "team-lead": React.ReactNode;
  adviser: React.ReactNode;
}) {
  return (
    <PushNotificationProvider>
      {/* 1. Static Content: Sent to browser immediately */}
      {children}

      {/* 2. Dynamic Content: Wrapped in Suspense to allow shell rendering */}
      <Suspense fallback={<AuthLoadingFallback />}>
        <RoleBasedSlot adviser={adviser} member={member} teamLead={teamLead} />
      </Suspense>
    </PushNotificationProvider>
  );
}

/**
 * Inner component that handles the dynamic auth check.
 * This component is deferred to request time.
 */

async function RoleBasedSlot({ member, teamLead, adviser }: any) {
  const { user, token } = await getAuthContext();

  if (!user) {
    return unauthorized();
  }

  const role = user.role; // "MEMBER" | "TEAM_LEAD" | "ADVISER"
  const slot =
    role === "TEAM_LEAD"
      ? teamLead
      : role === "MEMBER"
        ? member
        : role === "ADVISER"
          ? adviser
          : null;

  if (!slot) {
    return forbidden();
  }

  return (
    <AuthContextProvider token={token} user={user}>
      {slot}
    </AuthContextProvider>
  );
}
