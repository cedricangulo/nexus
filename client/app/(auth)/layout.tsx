import { forbidden, unauthorized } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AuthLoadingFallback } from "@/components/layouts/loading";
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
  const session = await auth(); // Accesses cookies()

  if (!session?.user) {
    return unauthorized();
  }

  const role = session.user.role;

  if (role === "teamLead") {
    return teamLead;
  }
  if (role === "member") {
    return member;
  }
  if (role === "adviser") {
    return adviser;
  }

  return forbidden();
}
