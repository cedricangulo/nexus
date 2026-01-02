"use server";

import { activityLogApi } from "@/lib/api/activity-log";
import { requireUser } from "@/lib/helpers/rbac";

export type ExportFormat = "csv" | "json";

export async function exportActivityLogsAction(format: ExportFormat) {
  try {
    // Require authentication
    const user = await requireUser();

    // Only Team Lead can export (Adviser cannot)
    if (user.role !== "teamLead") {
      return {
        success: false,
        error: "Unauthorized: Only Team Lead can export activity logs",
      };
    }

    // Fetch all activity logs
    const activities = await activityLogApi.listActivityLogs();

    if (format === "csv") {
      // Convert to CSV format
      const headers = [
        "Timestamp",
        "Action",
        "Actor",
        "Actor Email",
        "Entity Type",
        "Entity ID",
        "Details",
      ];

      const rows = activities.map((log) => [
        new Date(log.createdAt).toISOString(),
        log.action,
        log.user?.name || "Unknown",
        log.user?.email || "",
        log.entityType,
        log.entityId,
        log.details || "",
      ]);

      // Create CSV string
      const csvData = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((cell) => {
              // Escape quotes and wrap in quotes if contains comma/quote/newline
              const cellStr = String(cell);
              if (
                cellStr.includes(",") ||
                cellStr.includes('"') ||
                cellStr.includes("\n")
              ) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cellStr;
            })
            .join(",")
        ),
      ].join("\n");

      return {
        success: true,
        data: csvData,
        filename: `activity-logs-${new Date().toISOString().split("T")[0]}.csv`,
      };
    }

    // JSON format
    return {
      success: true,
      data: JSON.stringify(activities, null, 2),
      filename: `activity-logs-${new Date().toISOString().split("T")[0]}.json`,
    };
  } catch (error) {
    console.error("Export activity logs error:", error);
    return {
      success: false,
      error: "Failed to export activity logs",
    };
  }
}
