"use client";

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
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
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { deleteMeetingLog } from "@/actions/meetings";
import {
  GenericTableBody,
  GenericTableHeader,
} from "@/components/shared/table";
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
import { Table } from "@/components/ui/table";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UploadMinutesButton } from "../upload-button";
import { createMeetingColumns, type MeetingsTableRow } from ".";

type MeetingsTableProps = {
  initialLogs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
};

/**
 * Inline Meetings Table Filters
 * Handles search, scope filtering, and column visibility
 */
function MeetingsFilters({
  table,
  scopeCounts,
  uniqueScopeValues,
  sprints,
  phases,
}: {
  table: ReturnType<typeof useReactTable<MeetingsTableRow>>;
  scopeCounts: Map<string, number>;
  uniqueScopeValues: string[];
  sprints: Sprint[];
  phases: Phase[];
}) {
  const filterId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const searchValue = (table.getColumn("title")?.getFilterValue() ??
    "") as string;
  const selectedScopes = (table.getColumn("scope")?.getFilterValue() ??
    []) as string[];

  const handleScopeChange = (checked: boolean, value: string) => {
    const newScopes = checked
      ? [...selectedScopes, value]
      : selectedScopes.filter((s) => s !== value);
    table
      .getColumn("scope")
      ?.setFilterValue(newScopes.length ? newScopes : undefined);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Filter */}
        <div className="relative">
          <Input
            aria-label="Filter meeting minutes"
            className={cn("peer min-w-80 ps-9", searchValue && "pe-9")}
            id={`${filterId}-search`}
            onChange={(e) =>
              table.getColumn("title")?.setFilterValue(e.target.value)
            }
            placeholder="Search by title, uploader, sprint, phase..."
            ref={inputRef}
            type="text"
            value={searchValue}
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <ListFilterIcon aria-hidden="true" size={16} />
          </div>
          {searchValue ? (
            <button
              aria-label="Clear search filter"
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                table.getColumn("title")?.setFilterValue("");
                inputRef.current?.focus();
              }}
              type="button"
            >
              <CircleXIcon aria-hidden="true" size={16} />
            </button>
          ) : null}
        </div>

        {/* Scope Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <FilterIcon
                aria-hidden="true"
                className="-ms-1 opacity-60"
                size={16}
              />
              Scope
              {selectedScopes.length > 0 ? (
                <span className="-me-1 inline-flex h-5 max-h-full items-center rounded border bg-background px-1 font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                  {selectedScopes.length}
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto min-w-36 p-3">
            <div className="space-y-3">
              <div className="font-medium text-muted-foreground text-xs">
                Scope
              </div>
              <div className="space-y-3">
                {uniqueScopeValues.map((value, i) => (
                  <div className="flex items-center gap-2" key={value}>
                    <Checkbox
                      checked={selectedScopes.includes(value)}
                      id={`${filterId}-scope-${i}`}
                      onCheckedChange={(checked: boolean) =>
                        handleScopeChange(checked, value)
                      }
                    />
                    <Label
                      className="flex grow cursor-pointer justify-between gap-2 font-normal"
                      htmlFor={`${filterId}-scope-${i}`}
                    >
                      {value}
                      {scopeCounts.get(value) !== undefined && (
                        <span className="ms-2 text-muted-foreground text-xs">
                          ({scopeCounts.get(value)})
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

      {/* Upload Minutes Button */}
      <UploadMinutesButton phases={phases} sprints={sprints} />
    </div>
  );
}

export function MeetingsTable({
  initialLogs,
  phases,
  sprints,
}: MeetingsTableProps) {
  const id = useId();
  const [data, setData] = useState<MeetingLog[]>(initialLogs);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const withLoading = useCallback(
    async (ids: string[], callback: () => Promise<void>) => {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        for (const meetingId of ids) {
          next.add(meetingId);
        }
        return next;
      });
      try {
        await callback();
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          for (const meetingId of ids) {
            next.delete(meetingId);
          }
          return next;
        });
      }
    },
    []
  );

  const handleAction = useCallback(
    async (actionId: string, row: MeetingLog) => {
      if (actionId === "delete") {
        try {
          await withLoading([row.id], async () => {
            await deleteMeetingLog(row.id);
          });
          toast.success("Meeting minutes deleted");
          setData((prev) => prev.filter((l) => l.id !== row.id));
        } catch {
          toast.error("Failed to delete meeting minutes");
        }
      }
    },
    [withLoading]
  );

  const { columns, toRows } = useMemo(
    () =>
      createMeetingColumns({
        phases,
        sprints,
        loadingIds: deletingIds,
        onAction: handleAction,
      }),
    [deletingIds, phases, sprints, handleAction]
  );

  const tableData: MeetingsTableRow[] = useMemo(
    () => toRows(data),
    [data, toRows]
  );

  const table = useReactTable({
    columns,
    data: tableData,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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

  // Use TanStack Table's faceting feature for automatic count computation
  const scopeCounts = useMemo(() => {
    const scopeColumn = table.getColumn("scope");
    if (!scopeColumn) {
      return new Map<string, number>();
    }
    return scopeColumn.getFacetedUniqueValues();
  }, [table]);

  const uniqueScopeValues = useMemo(() => {
    const scopeColumn = table.getColumn("scope");
    if (!scopeColumn) {
      return [];
    }
    const values = Array.from(scopeColumn.getFacetedUniqueValues().keys());
    return values.sort();
  }, [table]);

  return (
    <div className="space-y-8">
      <MeetingsFilters
        phases={phases}
        scopeCounts={scopeCounts}
        sprints={sprints}
        table={table}
        uniqueScopeValues={uniqueScopeValues}
      />

      <div className="overflow-hidden rounded-md border bg-background">
        <Table className="table-fixed">
          <GenericTableHeader table={table} />
          <GenericTableBody
            emptyMessage="No meeting minutes found."
            table={table}
          />
        </Table>
      </div>

      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Label className="max-sm:sr-only" htmlFor={id}>
            Rows per page
          </Label>
          <Select
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            value={table.getState().pagination.pageSize.toString()}
          >
            <SelectTrigger className="w-fit whitespace-nowrap" id={id}>
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
