import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdviserTaskBoard } from "@/components/shared/sprints/sprint-details/adviser-task-board";
import { TaskFilters } from "@/components/shared/sprints/sprint-details/task-filters";
import { CreateTaskAction, KanbanBoardServer } from "@/components/shared/sprints/sprint-details/kanban-board";
import { PageHeader } from "@/components/shared/sprints/sprint-details/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSprintById } from "@/lib/data/sprint";
import { getAllUsersForDisplay } from "@/lib/data/team";
import { getAuthContext } from "@/lib/helpers/auth-token";
import KanbanBoardUI from "@/components/shared/sprints/sprint-details/kanban-container";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const { token, user } = await getAuthContext();

  const sprint = await getSprintById(id, token);
  if (!sprint) notFound();

  const isAdviser = user.role === "ADVISER";
  const allUsers = await getAllUsersForDisplay(token);
  
  // Filter out advisers (observers only, not task participants)
  const users = allUsers.filter((u) => u.role !== "ADVISER");

  return (
    <div className="space-y-6">
      <PageHeader sprintId={sprint.id} users={users} />

      {isAdviser ? (
        <Suspense fallback={<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-75 w-full rounded-xl" />)}</div>}>
          <AdviserTaskBoard 
            sprintId={sprint.id} 
            token={token} 
            searchParams={resolvedSearchParams}
          />
        </Suspense>
      ) : (
        <KanbanBoardUI action={<CreateTaskAction sprintId={sprint.id} token={token} />}>
          <KanbanBoardServer 
            sprintId={sprint.id} 
            token={token} 
            searchParams={resolvedSearchParams}
          />
        </KanbanBoardUI>
      )}
    </div>
  );
}
