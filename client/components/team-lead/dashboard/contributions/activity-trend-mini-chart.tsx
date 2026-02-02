"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ActivityLog } from "@/lib/types";

interface ActivityTrendMiniChartProps {
  activityLogs: ActivityLog[];
}

export function ActivityTrendMiniChart({
  activityLogs,
}: ActivityTrendMiniChartProps) {
  console.log("[ActivityTrendMiniChart] Received activityLogs:", activityLogs);
  console.log(
    "[ActivityTrendMiniChart] Total logs count:",
    activityLogs.length
  );
  console.log(
    "[ActivityTrendMiniChart] Sample actions:",
    activityLogs
      .slice(0, 5)
      .map((log) => ({ action: log.action, createdAt: log.createdAt }))
  );
  console.log("[ActivityTrendMiniChart] Unique actions:", [
    ...new Set(activityLogs.map((log) => log.action)),
  ]);

  // Get last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  console.log(
    "[ActivityTrendMiniChart] Date range:",
    last7Days[0].toISOString(),
    "to",
    today.toISOString()
  );

  // Action types to track (excluding COMMENT_CREATED)
  const actionTypes = {
    TASK_STATUS_CHANGED: "Tasks",
    EVIDENCE_UPLOADED: "Evidence",
    MEETING_LOG_UPLOADED: "Meetings",
  };

  // Aggregate activity by date and action type
  const chartData = last7Days.map((date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayLogs = activityLogs.filter((log) => {
      const logDate = new Date(log.createdAt);
      return logDate >= date && logDate < nextDay;
    });

    const data: Record<string, number | Date> = { date };

    for (const [actionType] of Object.entries(actionTypes)) {
      const count = dayLogs.filter((log) =>
        log.action.includes(actionType)
      ).length;
      data[actionType] = count;
      if (count > 0) {
        console.log(
          `[ActivityTrendMiniChart] ${date.toDateString()}: Found ${count} ${actionType}`
        );
      }
    }

    return data;
  });

  console.log("[ActivityTrendMiniChart] Generated chartData:", chartData);

  // Check if there's any activity
  const hasActivity = chartData.some((day) =>
    Object.keys(actionTypes).some((key) => (day[key] as number) > 0)
  );

  console.log("[ActivityTrendMiniChart] hasActivity:", hasActivity);

  if (!hasActivity) {
    return (
      <div className="flex h-11 items-center justify-center text-muted-foreground text-xs">
        No activity in the last 7 days
      </div>
    );
  }

  return (
    <ResponsiveContainer height={45} width="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
      >
        <Tooltip
          content={({ active, payload }) => {
            if (!(active && payload) || payload.length === 0) {
              return null;
            }

            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <p className="mb-1 font-medium text-xs">
                  {(payload[0]?.payload?.date as Date)?.toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric" }
                  )}
                </p>
                {payload.map((entry) => (
                  <div
                    className="flex items-center gap-2 text-xs"
                    key={entry.dataKey}
                  >
                    <div
                      className="size-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-muted-foreground">
                      {actionTypes[entry.dataKey as keyof typeof actionTypes]}:
                    </span>
                    <span className="font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        {/* Render areas in reverse order so most important is on top */}
        <Area
          dataKey="MEETING_LOG_UPLOADED"
          fill="var(--chart-2)"
          fillOpacity={0.3}
          stroke="var(--chart-2)"
          strokeWidth={1.5}
          type="monotoneX"
        />
        <Area
          dataKey="EVIDENCE_UPLOADED"
          fill="var(--chart-3)"
          fillOpacity={0.3}
          stroke="var(--chart-3)"
          strokeWidth={1.5}
          type="monotoneX"
        />
        <Area
          dataKey="TASK_STATUS_CHANGED"
          fill="var(--chart-1)"
          fillOpacity={0.3}
          stroke="var(--chart-1)"
          strokeWidth={1.5}
          type="monotoneX"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
