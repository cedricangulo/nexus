"use client";

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useId, useMemo } from "react";
import type { AppRole } from "@/auth";
import {
  GenericTableBody,
  GenericTableHeader,
} from "@/components/shared/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { useMeetingsTable } from "@/hooks/use-meetings-table";
import type { ScopeCounts } from "@/lib/data/meetings";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";
import { createMeetingColumns, type MeetingsTableRow } from ".";

type MeetingsTableProps = {
  initialLogs: MeetingLog[];
  sprints: Sprint[];
  phases: Phase[];
  currentUserRole: AppRole;
  scopeCounts: ScopeCounts;
};

export function MeetingsTable({
  initialLogs,
  phases,
  sprints,
  currentUserRole,
  scopeCounts,
}: MeetingsTableProps) {
  const id = useId();

  // Use custom hook for state management
  const {
    data,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    pagination,
    setPagination,
    sorting,
    setSorting,
    handleAction,
    deletingIds,
  } = useMeetingsTable(initialLogs);

  const { columns, toRows } = useMemo(
    () =>
      createMeetingColumns({
        phases,
        sprints,
        loadingIds: deletingIds,
        onAction: handleAction,
        currentUserRole,
      }),
    [deletingIds, phases, sprints, handleAction, currentUserRole]
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

  return (
    <div className="space-y-4">
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
