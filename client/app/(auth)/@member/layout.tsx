import { auth } from "@/auth";
import { AppHeader } from "@/components/layouts/member/header";
import { MemberMobileNav } from "@/components/layouts/member/nav";
import { SidebarBadgeLoader } from "@/components/layouts/sidebar-with-badges";
import Notification from "@/components/shared/notifications";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getProject } from "@/lib/data/project";
import { getAuthContext } from "@/lib/helpers/auth-token";

export default async function TeamLeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Early return if not a member (prevents data fetching for wrong roles)
  const session = await auth();
  if (session?.user.role !== "member") {
    return null;
  }

  const { user, token } = await getAuthContext();
  const project = await getProject(token);

  return (
    <SidebarProvider suppressHydrationWarning>
      <SidebarBadgeLoader user={user} variant="member" />
      <MemberMobileNav />
      <SidebarInset suppressHydrationWarning>
        <AppHeader
          notificationComponent={<Notification />}
          project={project}
          user={user}
        />
        <main className="p-4 pb-32 sm:p-8" suppressHydrationWarning>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
