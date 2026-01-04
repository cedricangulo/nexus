import { unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { PushNotificationProvider } from "@/providers/push-notification-provider";

// app/(auth)/layout.tsx
export default async function AuthLayout({
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
  const session = await auth();

  if (!session?.user) {
    return unauthorized();
  }

  // 1. Select the slot based on the user's role
  const role = session.user.role;
  let activeSlot: React.ReactNode;

  if (role === "teamLead") {
    activeSlot = teamLead;
  } else if (role === "member") {
    activeSlot = member;
  } else if (role === "adviser") {
    activeSlot = adviser;
  } else {
    return unauthorized();
  }

  // 2. Return the children AND the active slot
  return (
    <PushNotificationProvider>
      {/* Children allows for sub-pages like /settings to work */}
      {children}
      {/* The slot renders the specific dashboard UI */}
      {activeSlot}
    </PushNotificationProvider>
  );
}
