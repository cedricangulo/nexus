"use client";

import { ArrowDownAZ, ArrowUpAZ, RotateCcwIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/lib/types";
import { adviserTaskParsers } from "@/lib/types/search-params";
import { useIsMember } from "@/providers/auth-context-provider";

const SORT_OPTIONS = [
  { value: "createdAt", label: "Created Date" },
  { value: "title", label: "Title" },
  { value: "assigneeCount", label: "Assignees" },
] as const;

type TaskFiltersProps = {
  users: User[];
};

export function TaskFilters({ users }: TaskFiltersProps) {
  const isMember = useIsMember();
  const [filters, setFilters] = useQueryStates(adviserTaskParsers, {
    shallow: false,
    throttleMs: 300,
  });

  const handleResetFilters = () => {
    setFilters({
      assignee: "ALL",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const toggleSortOrder = () => {
    setFilters({
      sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
    });
  };

  const hasActiveFilters =
    filters.assignee !== "ALL" ||
    filters.sortBy !== "createdAt" ||
    filters.sortOrder !== "desc";

  return (
    <section className="flex flex-wrap items-end gap-4">
      {/* Assignee Filter */}
      {isMember ? null : (
        <div className="flex flex-col gap-2">
          <Label className="sr-only" htmlFor="assignee-select">
            Assignee
          </Label>
          <Select
            onValueChange={(value) => setFilters({ assignee: value })}
            value={filters.assignee}
          >
            <SelectTrigger className="w-45" id="assignee-select">
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Assignees</SelectItem>
              <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sort By Filter */}
      <Label className="sr-only" htmlFor="sort-select">
        Sort By
      </Label>
      <ButtonGroup>
        <Select
          onValueChange={(value) =>
            setFilters({ sortBy: value as typeof filters.sortBy })
          }
          value={filters.sortBy}
        >
          <SelectTrigger className="w-45" id="sort-select">
            <SelectValue placeholder="Select sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Sort Order Toggle */}
        <Button
          onClick={toggleSortOrder}
          size="icon"
          title={`Sort ${filters.sortOrder === "asc" ? "ascending" : "descending"}`}
          variant="outline"
        >
          {filters.sortOrder === "asc" ? <ArrowUpAZ /> : <ArrowDownAZ />}
        </Button>
      </ButtonGroup>

      {/* Reset Filters */}
      {hasActiveFilters ? (
        <Button onClick={handleResetFilters} variant="secondary">
          <RotateCcwIcon />
          Reset
        </Button>
      ) : null}
    </section>
  );
}
