/**
 * Custom hook for managing meetings table state
 * Extracts state management logic from MeetingsTable component
 * Handles pagination, sorting, column visibility, and delete actions
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import { toast } from "sonner";
import { deleteMeetingLog } from "@/actions/meetings";
import type { MeetingLog } from "@/lib/types";
import { meetingParsers } from "@/lib/types/search-params";

export function useMeetingsTable(initialLogs: MeetingLog[]) {
  // Data state
  const [data, setData] = useState<MeetingLog[]>(initialLogs);
  
  // TanStack Table state (client-side only)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  
  // Loading state for delete actions
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // URL state management with nuqs
  const [filters] = useQueryStates(meetingParsers, {
    shallow: false,
  });

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [filters.query, filters.scope]);

  // Update data when initialLogs change (server re-render)
  useEffect(() => {
    setData(initialLogs);
  }, [initialLogs]);

  // Loading wrapper for async actions
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

  // Handle delete action
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

  return useMemo(
    () => ({
      // Data
      data,
      setData,
      
      // Table state
      columnFilters,
      setColumnFilters,
      columnVisibility,
      setColumnVisibility,
      pagination,
      setPagination,
      sorting,
      setSorting,
      
      // Actions
      handleAction,
      deletingIds,
    }),
    [
      data,
      columnFilters,
      columnVisibility,
      pagination,
      sorting,
      handleAction,
      deletingIds,
    ]
  );
}
