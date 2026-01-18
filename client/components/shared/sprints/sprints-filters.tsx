"use client";

import { CalendarIcon, CircleXIcon, RotateCcwIcon, Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useId, useRef } from "react";
import { CreateSprintButton } from "@/components/shared/sprints/sprint-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status";
import { mapSprintStatusToTaskStatus } from "@/lib/helpers/sprint";
import { sprintParsers } from "@/lib/types/search-params";
import { cn } from "@/lib/utils";
import { useIsTeamLead } from "@/providers/auth-context-provider";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Sprints" },
  { value: "ACTIVE", label: "Active" },
  { value: "PLANNED", label: "Planned" },
  { value: "COMPLETED", label: "Completed" },
] as const;

export function SprintsFilters() {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const isTeamLead = useIsTeamLead();

  const [filters, setFilters] = useQueryStates(sprintParsers, {
    shallow: false,
    throttleMs: 300,
  });

  const handleClearSearch = () => {
    setFilters({ query: "" });
    inputRef.current?.focus();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters({ query: value });
  };

  const handleResetFilters = () => {
    // router.push("/sprints");
    setFilters({ query: "", status: "ALL", startDate: "", endDate: "" });
  };

  const hasActiveFilters =
    // filters.query !== "" ||
    filters.status !== "ALL" ||
    filters.startDate !== "" ||
    filters.endDate !== "";

  return (
    <section className="flex flex-wrap items-end gap-4">
      {/* Search and Reset */}
      <div className="flex w-full flex-col gap-4 sm:max-w-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full flex-1">
          <Input
            aria-label="Search sprints"
            className={`peer ps-9 ${filters.query ? "pe-9" : ""}`}
            id={`${id}-search`}
            onChange={handleSearchChange}
            placeholder="Search sprints..."
            ref={inputRef}
            type="text"
            value={filters.query}
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Search aria-hidden="true" size={16} />
          </div>
          {filters.query ? (
            <button
              aria-label="Clear search filter"
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleClearSearch}
              type="button"
            >
              <CircleXIcon aria-hidden="true" size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Status and Date Range Filters */}
      <div className="w-fit">
        <Label className="sr-only" htmlFor={`${id}-status`}>
          Status
        </Label>
        <Select
          onValueChange={(value) => setFilters({ status: value as any })}
          value={filters.status}
        >
          <SelectTrigger id={`${id}-status`}>
            <SelectValue placeholder="All sprints" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.value === "ALL" ? (
                  option.label
                ) : (
                  <StatusBadge
                    status={mapSprintStatusToTaskStatus(option.value)}
                  />
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex w-full items-end gap-4 sm:w-fit">
        <div className="flex flex-1 gap-4">
          <div className="flex-1 space-y-2">
            <Label
              className="text-muted-foreground"
              htmlFor={`${id}-start-date`}
            >
              Start Date
            </Label>
            <div className="relative">
              <Input
                className="ps-9 text-xs"
                id={`${id}-start-date`}
                onChange={(e) => setFilters({ startDate: e.target.value })}
                type="date"
                value={filters.startDate}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                <CalendarIcon aria-hidden="true" size={16} />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <Label className="text-muted-foreground" htmlFor={`${id}-end-date`}>
              End Date
            </Label>
            <div className="relative">
              <Input
                className="ps-9 text-xs"
                id={`${id}-end-date`}
                onChange={(e) => setFilters({ endDate: e.target.value })}
                type="date"
                value={filters.endDate}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                <CalendarIcon aria-hidden="true" size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "grid w-full gap-2 sm:w-fit",
          isTeamLead && hasActiveFilters ? "grid-cols-2" : "grid-cols-1"
        )}
      >
        {hasActiveFilters ? (
          <Button
            className="w-full gap-2 sm:w-fit"
            onClick={handleResetFilters}
            variant="secondary"
          >
            <RotateCcwIcon size={16} />
            Reset Filters
          </Button>
        ) : null}
        {isTeamLead ? <CreateSprintButton /> : null}
      </div>
    </section>
  );
}
