import axios from "axios";
import { format } from "date-fns";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound, unauthorized } from "next/navigation";
import { Suspense } from "react";
import { SprintDetailSkeleton } from "@/components/layouts/loading";
import { MemberKanbanBoard } from "@/components/member/sprints/member-kanban-board";
import { Button } from "@/components/ui/button";
import { FramePanel } from "@/components/ui/frame";
import { StatusBadge } from "@/components/ui/status";
import { getSprintById, getSprintTasks } from "@/lib/data/sprint";
import { getCurrentUser } from "@/lib/data/user";
import { getAuthContext } from "@/lib/helpers/auth-token";
import {
  getSprintStatus,
  mapSprintStatusToTaskStatus,
} from "@/lib/helpers/sprint";

async function SprintBoardContent({ sprintId }: { sprintId: string }) {
  const { token } = await getAuthContext();
  let sprint, currentUser, allTasks;

  try {
    [sprint, currentUser, allTasks] = await Promise.all([
      getSprintById(sprintId, token),
      getCurrentUser(token),
      getSprintTasks(sprintId, token),
    ]);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }
    throw error;
  }

  if (!(sprint && currentUser)) {
    notFound();
  }

  // Filter tasks to only show those assigned to the current user
  const userTasks = allTasks.filter((task) =>
    task.assignees?.some((a) => a.id === currentUser.id)
  );

  // AUTHORIZATION: Member can only access sprints where they have assigned tasks
  if (userTasks.length === 0) {
    return unauthorized();
  }

  const status = getSprintStatus(sprint);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost">
        <Link href="/sprints">
          <ChevronLeftIcon />
          Back to Sprints
        </Link>
      </Button>
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-semibold text-2xl">Sprint {sprint.number}</h1>
              <StatusBadge status={mapSprintStatusToTaskStatus(status)} />
            </div>
            {sprint.goal ? (
              <p className="text-muted-foreground">{sprint.goal}</p>
            ) : null}
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-sm">Start Date</p>
            <p className="font-medium">
              {format(new Date(sprint.startDate), "MMM d, yyyy")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">End Date</p>
            <p className="font-medium">
              {format(new Date(sprint.endDate), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Your Task Board</h2>
        <FramePanel>
          <MemberKanbanBoard
            currentUserId={currentUser.id}
            sprintId={sprint.id}
            tasks={userTasks}
          />
        </FramePanel>
      </div>
    </div>
  );
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  // Auth and role validation handled by parent layout
  const { id } = await params;

  return (
    <Suspense fallback={<SprintDetailSkeleton />}>
      <SprintBoardContent sprintId={id} />
    </Suspense>
  );
}
