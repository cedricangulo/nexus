"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleXIcon,
  Columns3Icon,
  FilterIcon,
  ListFilterIcon,
} from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import {
  GenericTableBody,
  GenericTableHeader,
} from "@/components/shared/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status";
import { Table } from "@/components/ui/table";
import { formatTitleCase } from "@/lib/helpers/format-title-case";
import type { ActivityLog, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type DetailsCellProps = {
  details: string | null;
};

function DetailsCell({ details }: DetailsCellProps) {
  if (!details) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  let parsedData: Record<string, unknown> | null = null;
  let parseError = false;

  try {
    parsedData = JSON.parse(details);
  } catch {
    parseError = true;
  }

  // If not JSON or parsing failed, show truncated text
  if (parseError || !parsedData) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="max-w-md truncate text-left text-muted-foreground text-sm underline decoration-dotted underline-offset-4 hover:text-foreground"
            type="button"
          >
            {details.slice(0, 50)}
            {details.length > 50 ? "..." : ""}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-96">
          <div className="space-y-2">
            <p className="font-medium text-sm">Raw Details</p>
            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">
              {details}
            </pre>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Show parsed JSON in a popover
  const entries = Object.entries(parsedData);
  const preview = entries
    .slice(0, 2)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(", ");

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
  ];

  const isStatus = (value: unknown): boolean =>
    typeof value === "string" && STATUS_VALUES.includes(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="max-w-md truncate text-left text-muted-foreground text-sm underline decoration-dotted underline-offset-4 hover:text-foreground"
          type="button"
        >
          {preview}
          {entries.length > 2 ? "..." : ""}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-96">
        <div className="space-y-3">
          <p className="font-medium text-sm">Activity Details</p>
          <div className="space-y-2 rounded-md bg-muted p-3">
            {entries.map(([key, value]) => (
              <div className="space-y-1" key={key}>
                <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  {formatTitleCase(key)}
                </p>
                {isStatus(value) ? (
                  <StatusBadge status={value as TaskStatus} />
                ) : (
                  <p className="wrap-break-word text-sm">
                    {typeof value === "object" && value !== null
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const getActionColor = (action: string): string => {
  // Positive actions (completed/success)
  if (action.includes("APPROVED") || action.includes("COMPLETED")) {
    return "bg-status-success/10 text-status-success dark:text-status-success";
  }
  // Negative actions (blocked/error)
  if (action.includes("REJECTED") || action.includes("DELETED")) {
    return "bg-status-error/10 text-status-error dark:text-status-error";
  }
  // Blocked/warning actions (blocked)
  if (action.includes("BLOCKED") || action.includes("PENDING")) {
    return "bg-status-error/10 text-status-error dark:text-status-error";
  }
  // Upload/create actions (in-progress/active)
  if (action.includes("UPLOAD") || action.includes("CREATED")) {
    return "bg-status-in-progress/10 text-status-in-progress dark:text-status-in-progress";
  }
  // Default (not started/neutral)
  return "bg-status-info/10 text-status-info dark:text-status-info";
};

type ActivityLogsClientProps = {
  activities: ActivityLog[];
};

function ActivityLogsFilters({
  table,
  actionTypes,
  actionCounts,
}: {
  table: ReturnType<typeof useReactTable<ActivityLog>>;
  actionTypes: string[];
  actionCounts: Map<string, number>;
}) {
  const filterId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const searchValue = (table.getColumn("action")?.getFilterValue() ??
    "") as string;
  const selectedActions = (table.getColumn("action")?.getFilterValue() ??
    []) as string[];

  const handleActionChange = (checked: boolean, value: string) => {
    const newActions = checked
      ? [...selectedActions, value]
      : selectedActions.filter((s) => s !== value);
    table
      .getColumn("action")
      ?.setFilterValue(newActions.length ? newActions : undefined);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Filter */}
        <div className="relative">
          <Input
            aria-label="Filter activity logs"
            className={cn("peer min-w-80 ps-9", searchValue && "pe-9")}
            id={`${filterId}-search`}
            onChange={(e) =>
              table.getColumn("user")?.setFilterValue(e.target.value)
            }
            placeholder="Search by user or action..."
            ref={inputRef}
            type="text"
            value={(table.getColumn("user")?.getFilterValue() ?? "") as string}
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <ListFilterIcon aria-hidden="true" size={16} />
          </div>
          {!!searchValue && (
            <button
              aria-label="Clear search filter"
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                table.getColumn("user")?.setFilterValue("");
                inputRef.current?.focus();
              }}
              type="button"
            >
              <CircleXIcon aria-hidden="true" size={16} />
            </button>
          )}
        </div>

        {/* Action Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <FilterIcon
                aria-hidden="true"
                className="-ms-1 opacity-60"
                size={16}
              />
              Action Type
              {selectedActions.length > 0 && (
                <span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                  {selectedActions.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto min-w-48 p-3">
            <div className="space-y-3">
              <div className="font-medium text-muted-foreground text-xs">
                Action Type
              </div>
              <div className="space-y-3">
                {actionTypes.map((action, i) => (
                  <div className="flex items-center gap-2" key={action}>
                    <Checkbox
                      checked={selectedActions.includes(action)}
                      id={`${filterId}-action-${i}`}
                      onCheckedChange={(checked: boolean) =>
                        handleActionChange(checked, action)
                      }
                    />
                    <Label
                      className="flex grow cursor-pointer justify-between gap-2 font-normal"
                      htmlFor={`${filterId}-action-${i}`}
                    >
                      {formatTitleCase(action)}
                      {actionCounts.get(action) !== undefined && (
                        <span className="ms-2 text-muted-foreground text-xs">
                          ({actionCounts.get(action)})
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Column Visibility Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Columns3Icon
                aria-hidden="true"
                className="-ms-1 opacity-60"
                size={16}
              />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  checked={column.getIsVisible()}
                  className="capitalize"
                  key={column.id}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  onSelect={(event) => event.preventDefault()}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function ActivityLogsClient({ activities }: ActivityLogsClientProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const columns = useMemo<ColumnDef<ActivityLog>[]>(
    () => [
      {
        id: "action",
        accessorKey: "action",
        size: 200,
        enableHiding: false,
        filterFn: (row, _columnId, filterValue) => {
          const selected = (filterValue ?? []) as string[];
          if (!selected.length) {
            return true;
          }
          return selected.includes(row.original.action);
        },
        header: "Action",
        cell: ({ row }) => {
          const action = row.original.action;
          const colorClass = getActionColor(action);

          return (
            <Badge
              className={cn("font-medium", colorClass)}
              variant="secondary"
            >
              {formatTitleCase(action)}
            </Badge>
          );
        },
      },
      {
        id: "user",
        accessorFn: (row) => row.user?.name ?? "System",
        size: 200,
        filterFn: (row, _columnId, filterValue) => {
          const searchTerm = (filterValue ?? "")
            .toString()
            .toLowerCase()
            .trim();
          if (!searchTerm) {
            return true;
          }

          const searchableContent = [
            row.original.user?.name,
            row.original.user?.email,
            row.original.action,
            row.original.entityType,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableContent.includes(searchTerm);
        },
        header: "User",
        cell: ({ row }) => {
          const user = row.original.user;
          if (!user) {
            return (
              <span className="text-muted-foreground text-sm">System</span>
            );
          }
          return (
            <div className="space-y-0">
              <p className="font-medium text-sm">{user.name}</p>
              <span className="text-muted-foreground text-xs">
                {user.email}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "entityType",
        size: 150,
        header: "Entity Type",
        cell: ({ row }) => (
          <div className="text-sm">
            {formatTitleCase(row.getValue("entityType"))}
          </div>
        ),
      },
      {
        accessorKey: "details",
        size: 300,
        header: "Details",
        cell: ({ row }) => {
          const details = row.getValue("details") as string | null;
          return <DetailsCell details={details} />;
        },
      },
      {
        accessorKey: "createdAt",
        size: 180,
        header: "Timestamp",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <div className="text-sm">
              {formatDistanceToNow(date, { addSuffix: true })}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: activities,
    columns,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      pagination,
      sorting,
    },
  });

  const actionTypes = useMemo(() => {
    const types = new Set(activities.map((a) => a.action));
    return Array.from(types).sort();
  }, [activities]);

  const actionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const activity of activities) {
      counts.set(activity.action, (counts.get(activity.action) || 0) + 1);
    }
    return counts;
  }, [activities]);

  return (
    <div className="space-y-8">
      <ActivityLogsFilters
        actionCounts={actionCounts}
        actionTypes={actionTypes}
        table={table}
      />

      <div className="overflow-hidden rounded-md border bg-background">
        <Table>
          <GenericTableHeader table={table} />
          <GenericTableBody
            emptyMessage="No activity logs found"
            table={table}
          />
        </Table>
      </div>

      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Label className="max-sm:sr-only">Rows per page</Label>
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            value={table.getState().pagination.pageSize.toString()}
          >
            <SelectTrigger className="w-fit whitespace-nowrap">
              <SelectValue placeholder="Select number of results" />
            </SelectTrigger>
            <SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex grow justify-end whitespace-nowrap text-muted-foreground text-sm">
          <p
            aria-live="polite"
            className="whitespace-nowrap text-muted-foreground text-sm"
          >
            <span className="text-foreground">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              -
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0
                ),
                table.getRowCount()
              )}
            </span>{" "}
            of{" "}
            <span className="text-foreground">
              {table.getRowCount().toString()}
            </span>
          </p>
        </div>
        {/* Pagination Controls */}
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  aria-label="Go to first page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.firstPage()}
                  size="icon"
                  variant="outline"
                >
                  <ChevronFirstIcon aria-hidden="true" size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  aria-label="Go to previous page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  size="icon"
                  variant="outline"
                >
                  <ChevronLeftIcon aria-hidden="true" size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  aria-label="Go to next page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  size="icon"
                  variant="outline"
                >
                  <ChevronRightIcon aria-hidden="true" size={16} />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  aria-label="Go to last page"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.lastPage()}
                  size="icon"
                  variant="outline"
                >
                  <ChevronLastIcon aria-hidden="true" size={16} />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
