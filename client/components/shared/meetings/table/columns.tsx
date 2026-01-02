"use client";

import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import type { AppRole } from "@/auth";
import { MeetingRowActions } from "@/components/shared/meetings/table/row-actions";
import { formatDate } from "@/lib/helpers/format-date";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";

export type MeetingsTableRow = MeetingLog & {
  contextLabel: string;
};

export const multiColumnFilterFn: FilterFn<MeetingsTableRow> = (
  row,
  _columnId,
  filterValue
) => {
  const searchTerm = (filterValue ?? "").toString().toLowerCase().trim();
  if (!searchTerm) {
    return true;
  }

  const uploader = row.original.uploader;
  const searchableRowContent = [
    row.original.title,
    row.original.contextLabel,
    uploader?.name,
    uploader?.email,
    row.getValue("scope") as string,
    formatDate(row.getValue("date") as string),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableRowContent.includes(searchTerm);
};

const scopeFilterFn: FilterFn<MeetingsTableRow> = (
  row,
  _columnId,
  filterValue
) => {
  const selected = (filterValue ?? []) as string[];
  if (!selected.length) {
    return true;
  }

  const scope = row.original.sprintId ? "Sprint" : "Phase";
  return selected.includes(scope);
};

function buildContextLabel(
  log: MeetingLog,
  sprints: Sprint[],
  phases: Phase[]
): string {
  if (log.sprintId) {
    const sprint = sprints.find((s) => s.id === log.sprintId);
    return sprint ? `Sprint ${sprint.number}` : "Sprint";
  }
  if (log.phaseId) {
    const phase = phases.find((p) => p.id === log.phaseId);
    return phase?.name ?? "Phase";
  }
  return "Unassigned";
}

type ColumnsContext = {
  phases: Phase[];
  sprints: Sprint[];
  onAction?: (actionId: string, row: MeetingsTableRow) => Promise<void>;
  loadingIds?: Set<string>;
  currentUserRole: AppRole;
};

export function createMeetingColumns(context: ColumnsContext): {
  columns: ColumnDef<MeetingsTableRow>[];
  toRows: (logs: MeetingLog[]) => MeetingsTableRow[];
} {
  const toRows = (logs: MeetingLog[]): MeetingsTableRow[] =>
    logs.map((log) => ({
      ...log,
      contextLabel: buildContextLabel(log, context.sprints, context.phases),
    }));

  const columns: ColumnDef<MeetingsTableRow>[] = [
    {
      accessorKey: "title",
      size: 220,
      enableHiding: false,
      filterFn: multiColumnFilterFn,
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-md truncate font-medium">
          {row.getValue("title")}
        </div>
      ),
    },
    {
      id: "scope",
      size: 120,
      accessorFn: (row) => {
        if (row.sprintId) {
          return "Sprint";
        }
        if (row.phaseId) {
          return "Phase";
        }
        return "Unassigned";
      },
      filterFn: scopeFilterFn,
      header: "Scope",
      cell: ({ row }) => <div className="text-sm">{row.getValue("scope")}</div>,
    },
    {
      accessorKey: "contextLabel",
      size: 120,
      header: "Sprint or Phase",
      cell: ({ row }) => (
        <div className="max-w-md truncate text-sm">
          {row.getValue("contextLabel")}
        </div>
      ),
    },
    {
      accessorKey: "date",
      size: 180,
      header: "Date",
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.getValue("date"))}</div>
      ),
    },
    {
      id: "uploader",
      size: 160,
      accessorFn: (row) => row.uploader?.name ?? "",
      header: "Uploaded by",
      cell: ({ row }) => {
        const uploader = row.original.uploader;
        if (!uploader) {
          return <span className="text-muted-foreground text-sm">Unknown</span>;
        }
        return (
          <div className="space-y-0">
            <p className="font-medium text-sm">{uploader.name}</p>
            <span className="text-muted-foreground text-xs">
              {uploader.email}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      size: 60,
      enableHiding: false,
      enableSorting: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <MeetingRowActions
          currentUserRole={context.currentUserRole}
          isLoading={context.loadingIds?.has(row.original.id) ?? false}
          meeting={row.original}
          onAction={async (actionId) => {
            await (context.onAction?.(actionId, row.original) ??
              Promise.resolve());
          }}
        />
      ),
    },
  ];

  return { columns, toRows };
}
