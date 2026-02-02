import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getActivityLogs } from "@/lib/data/activity-logs";
import { getTasks } from "@/lib/data/tasks";
import { getUserContribution, getUsers } from "@/lib/data/users";
import { getAuthContext } from "@/lib/helpers/auth-token";
import { ContributionCard } from "./contributions/contribution-card";

export default async function ContributionsTab() {
  const { token } = await getAuthContext();

  // Fetch all data in parallel
  const [users, allTasks, allActivityLogs] = await Promise.all([
    getUsers(token),
    getTasks(token),
    getActivityLogs(token),
  ]);

  // Filter active users only
  const activeUsers = users.filter((u) => !u.deletedAt);

  // TODO: PAGINATION - Future implementation
  // When implementing pagination:
  // 1. Add searchParams: { page?: string } to page component props
  // 2. Parse page number: const page = Number(searchParams?.page) || 1
  // 3. Define pageSize constant: const PAGE_SIZE = 7
  // 4. Calculate slice: const startIndex = (page - 1) * PAGE_SIZE
  // 5. Slice users: const paginatedUsers = activeUsers.slice(startIndex, startIndex + PAGE_SIZE)
  // 6. Calculate total pages: const totalPages = Math.ceil(activeUsers.length / PAGE_SIZE)
  // 7. Add pagination UI below grid (see commented section below)
  // 8. Use nuqs for URL state: useQueryState("page", parseAsInteger.withDefault(1))
  // 9. Update cache tags to include page number if needed
  // Current: Showing all users (max 7 members, no pagination needed yet)

  // Prepare member summaries with contributions
  const memberSummaries = await Promise.all(
    activeUsers.map(async (user) => {
      const contribution = await getUserContribution(user.id, token);
      const userActivityLogs = allActivityLogs.filter(
        (log) => log.userId === user.id
      );

      // Provide default contribution if null
      const safeContribution = contribution || {
        assignedTasksCount: 0,
        completedTasksCount: 0,
        uploadedEvidenceCount: 0,
        commentsCount: 0,
      };

      return {
        user,
        contribution: safeContribution,
        tasks: allTasks,
        activityLogs: userActivityLogs,
      };
    })
  );

  return (
    <div className="space-y-6 py-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {memberSummaries.map((summary) => (
          <Suspense
            fallback={
              <div className="space-y-4 rounded-2xl border bg-background p-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="size-20 rounded-full" />
                  <Skeleton className="h-24 flex-1" />
                </div>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </div>
            }
            key={summary.user.id}
          >
            <ContributionCard {...summary} />
          </Suspense>
        ))}
      </div>

      {/* TODO: PAGINATION UI - Uncomment when ready to implement
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
      */}
    </div>
  );
}
