import { Command } from "cmdk";
import {
  CheckCircle2,
  FileText,
  type LucideIcon,
  MessageSquare,
  Video,
} from "lucide-react";
import { memo } from "react";
import { formatRelativeTime } from "@/lib/helpers/format-date";
import { convertStorageToDisplay } from "@/lib/helpers/mentions";
import type {
  SearchComment,
  SearchDeliverable,
  SearchMeetingLog,
  SearchTask,
} from "@/lib/types/search";
import { StatusBadge } from "../ui/status";

/**
 * Configuration for rendering each search result type
 * Maps result types to their visual representation
 */
const RESULT_TYPE_CONFIG = {
  task: {
    icon: CheckCircle2,
    getPath: (item: SearchTask) =>
      item.sprintId ? `/sprints/${item.sprintId}` : "/sprints",
    getValue: (item: SearchTask) => `task-${item.id}-${item.title}`,
  },
  deliverable: {
    icon: FileText,
    getPath: (item: SearchDeliverable) => `/deliverables/${item.id}`,
    getValue: (item: SearchDeliverable) =>
      `deliverable-${item.id}-${item.title}`,
  },
  comment: {
    icon: MessageSquare,
    getPath: (item: SearchComment) =>
      item.deliverableId
        ? `/deliverables/${item.deliverableId}`
        : item.taskId
          ? "/sprints"
          : "/",
    getValue: (item: SearchComment) => `comment-${item.id}-${item.content}`,
  },
  meeting: {
    icon: Video,
    getPath: (_item: SearchMeetingLog) => "/meetings",
    getValue: (item: SearchMeetingLog) => `meeting-${item.id}-${item.title}`,
  },
} as const;

type ResultType = keyof typeof RESULT_TYPE_CONFIG;

/**
 * Props for SearchResultItem component
 * Uses discriminated union to ensure type safety for each result type
 */
type SearchResultItemProps =
  | {
      type: "task";
      data: SearchTask;
      onSelect: (path: string) => void;
    }
  | {
      type: "deliverable";
      data: SearchDeliverable;
      onSelect: (path: string) => void;
    }
  | {
      type: "comment";
      data: SearchComment;
      onSelect: (path: string) => void;
    }
  | {
      type: "meeting";
      data: SearchMeetingLog;
      onSelect: (path: string) => void;
    };

/**
 * Renders the content area for a search result
 * Each result type has a different layout and displays different information
 */
function SearchResultContent({ type, data }: { type: ResultType; data: any }) {
  if (type === "task" || type === "deliverable") {
    return (
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">{data.title}</p>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <StatusBadge status={data.status} />
          <span>{formatRelativeTime(data.createdAt)}</span>
        </div>
      </div>
    );
  }

  if (type === "comment") {
    return (
      <div className="flex-1 overflow-hidden">
        <p className="line-clamp-2 text-sm">
          {convertStorageToDisplay(data.content)}
        </p>
        <div className="text-muted-foreground text-xs">
          {data.authorName} · {formatRelativeTime(data.createdAt)}
        </div>
      </div>
    );
  }

  if (type === "meeting") {
    return (
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-medium">{data.title}</p>
        <time className="text-muted-foreground text-xs">
          {formatRelativeTime(data.date)}
        </time>
      </div>
    );
  }

  return null;
}

/**
 * Memoized search result item component
 *
 * Renders a single search result with appropriate icon, content, and click handler.
 * Uses React.memo to prevent unnecessary re-renders when other results change.
 *
 * Performance optimizations:
 * - Memoized to avoid re-rendering unchanged items
 * - Type-specific rendering logic separated into SearchResultContent
 * - Icon and path logic extracted to RESULT_TYPE_CONFIG for O(1) lookup
 *
 * @param type - The type of search result (task, deliverable, comment, meeting)
 * @param data - The result data matching the specified type
 * @param onSelect - Callback when user selects this result
 */
export const SearchResultItem = memo(function SearchResultItem({
  type,
  data,
  onSelect,
}: SearchResultItemProps) {
  const config = RESULT_TYPE_CONFIG[type];
  const Icon: LucideIcon = config.icon;
  const path = config.getPath(data as any);
  const value = config.getValue(data as any);

  return (
    <Command.Item
      className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50"
      key={data.id}
      onSelect={() => onSelect(path)}
      value={value}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <SearchResultContent data={data} type={type} />
    </Command.Item>
  );
});
