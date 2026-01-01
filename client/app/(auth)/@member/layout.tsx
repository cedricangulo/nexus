import { AppHeader } from "@/components/layouts/member/header";
import { AppSidebar } from "@/components/layouts/member/member-sidebar";
import { MemberMobileNav } from "@/components/layouts/member/nav";
import Notification from "@/components/shared/notifications";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getProject } from "@/lib/data/project";
import { getCurrentUser } from "@/lib/data/user";

export default async function TeamLeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user and project data server-side
  const user = await getCurrentUser();
  const project = await getProject();

  return (
    <SidebarProvider suppressHydrationWarning>
      <AppSidebar user={user} />
      <MemberMobileNav />
      <SidebarInset suppressHydrationWarning>
        <AppHeader
          notificationComponent={<Notification />}
          project={project}
          user={user}
        />
        <main className="p-4 pb-32 sm:p-8 md:pb-0" suppressHydrationWarning>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
