"use client";

import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleXIcon,
  Download,
  FilterIcon,
  ListFilterIcon,
  X,
} from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { exportActivityLogsAction } from "@/actions/activity-logs";
import { ActivityLogCard } from "@/components/team-lead/settings/activity-logs/activity-log-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { formatTitleCase } from "@/lib/helpers/format-title-case";
import type { ActivityLog } from "@/lib/types";

type ActivityLogsClientProps = {
  activities: ActivityLog[];
  userRole?: string;
};

function ActivityLogsFilters({
  searchValue,
  onSearchChange,
  selectedActions,
  onActionChange,
  actionTypes,
  actionCounts,
  onClearFilters,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedActions: string[];
  onActionChange: (checked: boolean, value: string) => void;
  actionTypes: string[];
  actionCounts: Map<string, number>;
  onClearFilters: () => void;
}) {
  const filterId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Filter */}
        <div className="relative">
          <Input
            aria-label="Filter activity logs"
            className="peer min-w-80 ps-9 pe-9"
            id={`${filterId}-search`}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by user or action..."
            ref={inputRef}
            type="text"
            value={searchValue}
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <ListFilterIcon aria-hidden="true" size={16} />
          </div>
          {!!searchValue && (
            <button
              aria-label="Clear search filter"
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                onSearchChange("");
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
                        onActionChange(checked, action)
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

        {/* Clear Filters Button */}
        {(searchValue || selectedActions.length > 0) && (
          <Button onClick={onClearFilters} variant="ghost">
            <X size={16} />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}

export function ActivityLogsClient({
  activities,
  userRole = "teamLead",
}: ActivityLogsClientProps) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleActionChange = (checked: boolean, value: string) => {
    const newActions = checked
      ? [...selectedActions, value]
      : selectedActions.filter((s) => s !== value);
    setSelectedActions(newActions);
    setPageIndex(0); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setSelectedActions([]);
    setPageIndex(0);
  };

  // Filter activities based on search and selected actions
  const filteredActivities = useMemo(() => {
    return activities.filter((log) => {
      // Action filter
      if (selectedActions.length > 0 && !selectedActions.includes(log.action)) {
        return false;
      }

      // Search filter
      if (searchValue) {
        const searchTerm = searchValue.toLowerCase().trim();
        const searchableContent = [
          log.user?.name,
          log.user?.email,
          log.action,
          log.entityType,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableContent.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [activities, searchValue, selectedActions]);

  // Sort by createdAt descending (newest first)
  const sortedActivities = useMemo(
    () =>
      [...filteredActivities].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [filteredActivities]
  );

  // Paginate
  const paginatedActivities = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return sortedActivities.slice(start, end);
  }, [sortedActivities, pageIndex, pageSize]);

  const totalPages = Math.ceil(sortedActivities.length / pageSize);
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < totalPages - 1;

  const handleExport = async (format: "csv" | "json") => {
    try {
      setIsExporting(true);
      const result = await exportActivityLogsAction(format);

      if (!(result.success && result.data)) {
        toast.error(result.error || "Failed to export activity logs");
        return;
      }

      // Create blob and download
      const blob = new Blob([result.data], {
        type:
          format === "csv"
            ? "text/csv;charset=utf-8;"
            : "application/json;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 500);

      toast.success(`Activity logs exported as ${result.filename}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export activity logs");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ActivityLogsFilters
          actionCounts={actionCounts}
          actionTypes={actionTypes}
          onActionChange={handleActionChange}
          onClearFilters={handleClearFilters}
          onSearchChange={setSearchValue}
          searchValue={searchValue}
          selectedActions={selectedActions}
        />

        {/* Export Button (Team Lead only) */}
        {userRole === "teamLead" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2" disabled={isExporting}>
                <Download size={16} />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Results count */}
      <div className="text-muted-foreground text-sm">
        {searchValue || selectedActions.length > 0 ? (
          <>
            Showing {filteredActivities.length} matching logs (
            {filteredActivities.length} found across all {activities.length}{" "}
            logs )
          </>
        ) : (
          <>
            Showing {Math.min(pageSize, sortedActivities.length)} logs on this
            page (total {sortedActivities.length} logs)
          </>
        )}
      </div>

      {/* Logs list */}
      <div className="rounded-lg border border-border bg-card">
        {paginatedActivities.length > 0 ? (
          <div className="divide-y divide-border p-4">
            {paginatedActivities.map((log) => (
              <ActivityLogCard key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            {searchValue || selectedActions.length > 0
              ? "No logs match your search or filter."
              : "No activity logs found."}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Label className="max-sm:sr-only">Rows per page</Label>
            <Select
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPageIndex(0);
              }}
              value={pageSize.toString()}
            >
              <SelectTrigger className="w-fit whitespace-nowrap">
                <SelectValue placeholder="Select number of results" />
              </SelectTrigger>
              <SelectContent className="[&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
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
                {pageIndex * pageSize + 1}-
                {Math.min((pageIndex + 1) * pageSize, sortedActivities.length)}
              </span>{" "}
              of{" "}
              <span className="text-foreground">{sortedActivities.length}</span>
            </p>
          </div>
          <div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    aria-label="Go to first page"
                    className="disabled:pointer-events-none disabled:opacity-50"
                    disabled={!canPreviousPage}
                    onClick={() => setPageIndex(0)}
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
                    disabled={!canPreviousPage}
                    onClick={() => setPageIndex(pageIndex - 1)}
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
                    disabled={!canNextPage}
                    onClick={() => setPageIndex(pageIndex + 1)}
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
                    disabled={!canNextPage}
                    onClick={() => setPageIndex(totalPages - 1)}
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
      )}
    </div>
  );
}
