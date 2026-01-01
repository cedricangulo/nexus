import { AppHeader } from "@/components/layouts/team-lead/header";
import { AppSidebar } from "@/components/layouts/team-lead/team-lead-sidebar";
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
      <SidebarInset suppressHydrationWarning>
        <AppHeader notificationComponent={<Notification />} project={project} />
        <main className="p-4 sm:p-8" suppressHydrationWarning>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
