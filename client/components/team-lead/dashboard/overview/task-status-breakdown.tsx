"use cache";

import { Info } from "lucide-react";
import { cacheLife } from "next/cache";
import { StatusBreakdownBar } from "@/components/ui/status-breakdown-bar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTaskStatusBreakdown } from "@/lib/data/analytics";

export async function TaskStatusBreakdown({ token }: { token: string }) {
  cacheLife("minutes");

  const breakdown = await getTaskStatusBreakdown(token);

  if (breakdown.totalTasks === 0) {
    return <div className="text-muted-foreground text-xs">No tasks yet</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium font-sora text-muted-foreground text-xs">
          {breakdown.totalTasks} Tasks
        </h4>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="size-4 cursor-help text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="p-3">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 [&_svg]:text-xs">
              <div className="flex items-center gap-2">
                <div className="size-2 shrink-0 rounded-xs bg-chart-1" />
                <span>{breakdown.completedTasks} Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 shrink-0 rounded-xs bg-chart-3" />
                <span>{breakdown.inProgressTasks} In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 shrink-0 rounded-xs bg-chart-4" />
                <span>{breakdown.blockedTasks} Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 shrink-0 rounded-xs bg-muted" />
                <span>{breakdown.todoTasks} To Do</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
      <StatusBreakdownBar
        blocks={[
          {
            count: breakdown.completedTasks,
            color: "bg-chart-1",
            label: "Completed",
          },
          {
            count: breakdown.inProgressTasks,
            color: "bg-chart-3",
            label: "In Progress",
          },
          {
            count: breakdown.blockedTasks,
            color: "bg-chart-4",
            label: "Blocked",
          },
          {
            count: breakdown.todoTasks,
            color: "bg-muted",
            label: "To Do",
          },
        ]}
        height="h-3"
      />
    </div>
  );
}
