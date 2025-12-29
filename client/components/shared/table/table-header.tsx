"use client";

import { flexRender } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { GenericTableHeaderProps } from "./types";

/**
 * Generic Table Header Component
 * Renders table header with all visible columns, including sorting indicators
 *
 * @example
 * ```tsx
 * <Table>
 *   <GenericTableHeader table={table} />
 * </Table>
 * ```
 */
export function GenericTableHeader<T>({ table }: GenericTableHeaderProps<T>) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow className="hover:bg-transparent" key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead
              className="h-11"
              key={header.id}
              style={{ width: `${header.getSize()}px` }}
            >
              {header.isPlaceholder ? null : header.column.getCanSort() ? (
                <div
                  aria-sort={
                    header.column.getIsSorted() === "asc"
                      ? "ascending"
                      : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : "none"
                  }
                  className={cn(
                    "flex h-full cursor-pointer select-none items-center justify-between gap-2"
                  )}
                  onClick={() =>
                    header.column.toggleSorting(
                      header.column.getIsSorted() === "asc"
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      header.column.toggleSorting(
                        header.column.getIsSorted() === "asc"
                      );
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  <span aria-hidden="true">
                    {header.column.getIsSorted() === "asc" && (
                      <ChevronUpIcon
                        className="shrink-0 opacity-60"
                        size={16}
                      />
                    )}
                    {header.column.getIsSorted() === "desc" && (
                      <ChevronDownIcon
                        className="shrink-0 opacity-60"
                        size={16}
                      />
                    )}
                  </span>
                </div>
              ) : (
                flexRender(header.column.columnDef.header, header.getContext())
              )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}

export { TableHeader };
