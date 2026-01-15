import { format } from "date-fns";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status";
import { getSprintMetadata } from "@/lib/data/sprint";
import { getSprintStatus, mapSprintStatusToTaskStatus } from "@/lib/helpers";
import { getAuthContext } from "@/lib/helpers/auth-token";
import type { User } from "@/lib/types";
import { TaskFilters } from "./task-filters";

type Props = {
  sprintId: string;
  users: User[];
};

export async function PageHeader({ sprintId, users }: Props) {
  const { token } = await getAuthContext();
  const sprint = await getSprintMetadata(sprintId, token);

  if (!sprint) {
    return null;
  }

  return <PageHeaderUI sprint={sprint} users={users} />;
}

type PageHeaderUIProps = {
  sprint: {
    id: string;
    projectId: string;
    number: number;
    goal?: string | null | undefined;
    startDate: string;
    endDate: string;
  };
  users: User[];
};

async function PageHeaderUI({ sprint, users }: PageHeaderUIProps) {
  "use cache";

  const status = getSprintStatus(sprint);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="icon" variant="outline">
            <Link href="/sprints">
              <ChevronLeftIcon />
            </Link>
          </Button>
          <h1 className="font-semibold text-2xl">Sprint {sprint.number}</h1>
          <StatusBadge status={mapSprintStatusToTaskStatus(status)} />
        </div>
        {sprint.goal ? (
          <p className="text-muted-foreground">{sprint.goal}</p>
        ) : null}
      </div>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4 divide-x divide-border text-sm">
          <div className="space-x-2 pr-4">
            <span className="text-muted-foreground text-sm">Start</span>
            <span className="font-medium">
              {format(new Date(sprint.startDate), "MMM d, yyyy")}
            </span>
          </div>
          <div className="space-x-2">
            <span className="text-muted-foreground text-sm">End</span>
            <span className="font-medium">
              {format(new Date(sprint.endDate), "MMM d, yyyy")}
            </span>
          </div>
        </div>
        <TaskFilters users={users} />
      </div>
    </div>
  );
}
