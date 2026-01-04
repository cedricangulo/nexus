import { auth } from "@/auth";
import { SidebarBadgeLoader } from "@/components/layouts/sidebar-with-badges";
import { AppHeader } from "@/components/layouts/team-lead/header";
import Notification from "@/components/shared/notifications";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getProject } from "@/lib/data/project";
import { getCurrentUser } from "@/lib/data/user";

export default async function TeamLeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Early return if not a team lead (prevents data fetching for wrong roles)
  const session = await auth();
  if (session?.user.role !== "teamLead") {
    return null;
  }

  // Fetch only what's needed for initial render
  // Badge counts are fetched asynchronously via Suspense
  const [user, project] = await Promise.all([getCurrentUser(), getProject()]);

  return (
    <SidebarProvider suppressHydrationWarning>
      <SidebarBadgeLoader user={user} variant="team-lead" />
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
