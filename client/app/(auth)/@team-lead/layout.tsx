import { AppHeader } from "@/components/layouts/team-lead/header";
import { AppSidebar } from "@/components/layouts/team-lead/team-lead-sidebar";
import Notification from "@/components/shared/notifications";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getBadgeCounts } from "@/lib/data/badge-counts";
import { getProject } from "@/lib/data/project";
import { getCurrentUser } from "@/lib/data/user";

export default async function TeamLeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user, project, and badge counts server-side
  const [user, project] = await Promise.all([getCurrentUser(), getProject()]);

  // Get badge counts for the user (team leads see all counts)
  const badgeCounts = await getBadgeCounts(user);

  return (
    <SidebarProvider suppressHydrationWarning>
      <AppSidebar badgeCounts={badgeCounts} user={user} />
      <SidebarInset suppressHydrationWarning>
        <AppHeader
          notificationComponent={<Notification />}
          project={project}
          user={user}
        />
        <main className="p-4 sm:p-8" suppressHydrationWarning>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
