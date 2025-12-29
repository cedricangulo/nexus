/**
 * Blocked Items List
 * Server component that fetches blocked tasks and displays them
 */
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import { taskApi } from "@/lib/api/task";
import { userApi } from "@/lib/api/user";
import type { BlockedItem } from "@/lib/helpers/dashboard-computations";
import { getBlockedTasks } from "@/lib/helpers/dashboard-computations";

type BlockedItemsListProps = {
  items: BlockedItem[];
};

function BlockedItemsListDisplay({ items }: BlockedItemsListProps) {
  if (items.length === 0) {
    return (
      <Frame>
        <FrameHeader className="flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-linear-120 from-status-blocked to-status-blocked/80 p-2 shadow-sm">
              <AlertCircle className="size-4 text-white" />
            </div>
            <FrameTitle className="text-sm">Blocked Tasks</FrameTitle>
          </div>
        </FrameHeader>
        <FramePanel>
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
              <AlertCircle className="h-6 w-6 text-chart-2" />
            </div>
            <p className="mt-4 font-medium text-muted-foreground text-sm">
              No blocked Tasks
            </p>
            <p className="text-muted-foreground text-xs">
              All tasks and deliverables are progressing smoothly
            </p>
          </div>
        </FramePanel>
      </Frame>
    );
  }

  return (
    <Frame>
      <FrameHeader className="flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-linear-120 from-status-blocked to-status-blocked/80 p-2 shadow-sm">
            <AlertCircle className="size-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <FrameTitle className="text-sm">Blocked Tasks</FrameTitle>
            <Badge variant="outline">{items.length}</Badge>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/sprints">View All</Link>
        </Button>
      </FrameHeader>
      <FramePanel>
        {items.slice(0, 5).map((item) => (
          <div className="mb-2" key={item.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="font-medium text-sm leading-tight group-hover:text-primary">
                  {item.title}
                </p>
                {item.assignee ? (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <User size={16} />
                    {item.assignee.name}
                  </div>
                ) : null}
              </div>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(item.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {item.reason ? (
              <p className="text-muted-foreground text-xs leading-relaxed">
                {item.reason}
              </p>
            ) : null}
          </div>
        ))}

        {items.length > 5 && (
          <div className="border-border border-t p-3 text-center">
            <Button asChild size="sm" variant="outline">
              <Link href="/sprints">
                View {items.length - 5} more blocked items
              </Link>
            </Button>
          </div>
        )}
      </FramePanel>
    </Frame>
  );
}

export async function BlockedItemsList() {
  const [tasks, users] = await Promise.all([
    taskApi.listTasks(),
    userApi.listUsers(),
  ]);

  const blockedTasks = getBlockedTasks(tasks, users);
  const allBlockedItems = [...blockedTasks].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return <BlockedItemsListDisplay items={allBlockedItems} />;
}
