"use client";

import { formatDistanceToNow } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status";
import { formatDateTime } from "@/lib/helpers/format-date";
import { formatTitleCase } from "@/lib/helpers/format-title-case";
import type { ActivityLog, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type ActivityLogCardProps = {
  log: ActivityLog;
};

const STATUS_VALUES = [
  "COMPLETED",
  "DONE",
  "IN_PROGRESS",
  "REVIEW",
  "BLOCKED",
  "TODO",
  "NOT_STARTED",
  "WATERFALL",
  "SCRUM",
  "FALL",
  "APPROVED",
  "REJECTED",
];

const isStatus = (value: unknown): boolean =>
  typeof value === "string" && STATUS_VALUES.includes(value);

const getActionColor = (
  action: string
): "success" | "error" | "in-progress" | "info" => {
  if (action.includes("APPROVED") || action.includes("COMPLETED")) {
    return "success";
  }
  if (action.includes("REJECTED") || action.includes("DELETED")) {
    return "error";
  }
  if (action.includes("BLOCKED") || action.includes("PENDING")) {
    return "error";
  }
  if (action.includes("UPLOAD") || action.includes("CREATED")) {
    return "in-progress";
  }
  return "info";
};

export function ActivityLogCard({ log }: ActivityLogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const actorName = log.user?.name || log.user?.email || "Unknown User";

  const timeAgo = formatDistanceToNow(new Date(log.createdAt), {
    addSuffix: true,
  });

  let parsedDetails: Record<string, unknown> | null = null;
  if (log.details) {
    try {
      parsedDetails = JSON.parse(log.details);
    } catch {
      parsedDetails = null;
    }
  }

  return (
    <div className="border-border border-b py-4 first:pt-0 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => setIsExpanded(!isExpanded)}
              type="button"
            >
              {actorName}
            </button>
            <span className="text-muted-foreground text-sm">–</span>
            <button
              className="text-blue-600 text-sm hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => setIsExpanded(!isExpanded)}
              type="button"
            >
              {log.action.toLowerCase().replace(/_/g, " ")}
            </button>
          </div>

          <p className="mt-1 text-muted-foreground text-sm">
            {log.entityType} {log.action.toLowerCase()}
          </p>

          <div className="mt-2 flex items-center gap-3 text-muted-foreground text-xs">
            <span>{timeAgo}</span>
          </div>
        </div>

        <Button
          aria-label={isExpanded ? "Collapse details" : "Expand details"}
          className="h-8 w-8 shrink-0 rounded-md"
          onClick={() => setIsExpanded(!isExpanded)}
          size="icon"
          variant="ghost"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 border-border border-t pt-4">
          <div className="grid grid-cols-1 text-sm">
            <div className="grid grid-cols-2 hover:bg-accent">
              <div className="font-medium text-foreground">@timestamp</div>
              <div className="mt-0.5 font-sora text-muted-foreground">
                {new Date(log.createdAt).toISOString()} or{" "}
                {formatDateTime(log.createdAt)}
              </div>
            </div>

            <div className="grid grid-cols-2 hover:bg-accent">
              <div className="font-medium text-foreground">action</div>
              <div className="mt-0.5">
                <Badge
                  variant={
                    getActionColor(log.action) as
                      | "success"
                      | "error"
                      | "in-progress"
                      | "info"
                  }
                >
                  {log.action}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 hover:bg-accent">
              <div className="font-medium text-foreground">actor</div>
              <div className="mt-0.5 font-sora text-muted-foreground">
                {actorName}
              </div>
            </div>

            <div className="grid grid-cols-2 hover:bg-accent">
              <div className="font-medium text-foreground">actor_id</div>
              <div className="mt-0.5 font-sora text-muted-foreground">
                {log.userId}
              </div>
            </div>

            {log.user?.email && (
              <div className="grid grid-cols-2 hover:bg-accent">
                <div className="font-medium text-foreground">actor_email</div>
                <div className="mt-0.5 font-sora text-muted-foreground">
                  {log.user.email}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 hover:bg-accent">
              <div className="font-medium text-foreground">entity_type</div>
              <div className="mt-0.5 font-sora text-muted-foreground">
                {log.entityType}
              </div>
            </div>

            {log.entityId && (
              <div className="grid grid-cols-2 hover:bg-accent">
                <div className="font-medium text-foreground">entity_id</div>
                <div className="mt-0.5 font-sora text-muted-foreground">
                  {log.entityId}
                </div>
              </div>
            )}

            {parsedDetails && (
              <div className="grid grid-cols-2 hover:bg-accent">
                <div className="font-medium text-foreground">details</div>
                <div className="mt-2">
                  <div className="space-y-2 rounded-md border border-border bg-muted/50 p-3">
                    {Object.entries(parsedDetails).map(([key, value]) => (
                      <div key={key}>
                        <div className="mb-1 text-muted-foreground text-xs capitalize">
                          {formatTitleCase(key)}
                        </div>
                        <div className="break-all text-sm">
                          {isStatus(value) ? (
                            <StatusBadge status={value as TaskStatus} />
                          ) : (
                            <span className="text-foreground">
                              {typeof value === "object" && value !== null
                                ? JSON.stringify(value, null, 2)
                                : String(value)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!parsedDetails && log.details && (
              <div className="grid grid-cols-2 hover:bg-accent">
                <div className="font-medium text-foreground">details</div>
                <div className="mt-0.5 break-all font-mono text-muted-foreground text-xs">
                  {log.details}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
