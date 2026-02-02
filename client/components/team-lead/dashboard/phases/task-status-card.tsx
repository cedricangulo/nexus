import { Info, ListTodo } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { StatusBreakdownBar } from "@/components/ui/status-breakdown-bar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getPhasesWithDetails } from "@/lib/data/phases";

export async function TaskStatus({ token }: { token: string }) {
  "use cache";
  cacheLife("minutes");
  cacheTag("tasks", "phases");

  const phases = await getPhasesWithDetails(token);

  // Aggregate all tasks from all phases
  const allTasks = phases.flatMap((phase) => phase.tasks || []);

  // Count by status
  const done = allTasks.filter(
    (t) => t.status === "DONE" && !t.deletedAt
  ).length;
  const inProgress = allTasks.filter(
    (t) => t.status === "IN_PROGRESS" && !t.deletedAt
  ).length;
  const blocked = allTasks.filter(
    (t) => t.status === "BLOCKED" && !t.deletedAt
  ).length;
  const toDo = allTasks.filter(
    (t) => t.status === "TODO" && !t.deletedAt
  ).length;

  const total = done + inProgress + blocked + toDo;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium font-sora text-muted-foreground text-xs">
          {total} Tasks
        </h4>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="size-4 cursor-help text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="p-3">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 [&_svg]:text-xs">
              <div className="flex items-center gap-2">
                <div className="size-2 shrink-0 rounded-xs bg-chart-1" />
                <span>{done} Done</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 shrink-0 rounded-xs bg-chart-3" />
                <span>{inProgress} In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 shrink-0 rounded-xs bg-chart-4" />
                <span>{blocked} Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 shrink-0 rounded-xs bg-muted" />
                <span>{toDo} To Do</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
      <StatusBreakdownBar
        blocks={[
          {
            label: "Done",
            count: done,
            color: "bg-chart-1",
          },
          {
            label: "In Progress",
            count: inProgress,
            color: "bg-chart-3",
          },
          {
            label: "Blocked",
            count: blocked,
            color: "bg-chart-4",
          },
          {
            label: "To Do",
            count: toDo,
            color: "bg-muted",
          },
        ]}
        height="h-3"
      />
    </div>
  );
}

export function TaskStatusCard({ children }: { children: React.ReactNode }) {
  return (
    <Frame>
      <FrameHeader className="flex-row items-center gap-2">
        <ListTodo aria-hidden="true" className="size-4 text-muted-foreground" />
        <FrameTitle className="font-normal text-muted-foreground text-sm">
          Task Status
        </FrameTitle>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
