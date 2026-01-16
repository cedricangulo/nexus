import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Suspense } from "react";
import { forbidden, unauthorized } from "next/navigation";
import { AppHeader } from "@/components/layouts/app-header";
import MobileNav from "@/components/layouts/nav";
import { SidebarBadgeLoader } from "@/components/layouts/sidebar-badge-loader";
import Notification from "@/components/shared/notifications";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getProject } from "@/lib/data/project";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { AuthContextProvider } from "@/providers/auth-context-provider";
import { Spinner } from "@/components/ui/spinner";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider suppressHydrationWarning>
      <Suspense fallback={<LayoutSkeleton />}>
        <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
      </Suspense>
    </SidebarProvider>
  );
}

async function AuthenticatedLayoutContent({ children }: { children: React.ReactNode }) {

  const { user, token } = await getAuthContext();

  if (!user) return unauthorized();
  if (!user.role) return forbidden();

  const project = await getProject(token);

  return (
    <AuthContextProvider token={token} user={user}>
      <SidebarBadgeLoader token={token} user={user} />
      <SidebarInset suppressHydrationWarning>
        <AppHeader
          notificationComponent={<Notification />}
          project={project}
          user={user}
        />
        <main className="p-4 pb-32 sm:p-8 sm:pb-8" suppressHydrationWarning>
          <NuqsAdapter>
            {children}
          </NuqsAdapter>
        </main>
      </SidebarInset>
      {user.role !== "TEAM_LEAD" ? <MobileNav /> : null}
    </AuthContextProvider>
  );
}

function LayoutSkeleton() {
  return (
    <SidebarInset>
      <main className="flex flex-col gap-4 items-center justify-center min-h-dvh">
        <Spinner className="size-12" />
        <div className="text-center">
          <p className="font-bold font-sora text-foreground text-4xl">
            Nexus
          </p>
          <p className="text-muted-foreground text-xs">
            Capstone Management System
          </p>
        </div>
      </main>
    </SidebarInset>
  );
}
