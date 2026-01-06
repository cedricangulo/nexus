"use client";

import { CircleXIcon, ListFilterIcon } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status";
import type { Phase } from "@/lib/types";
import { DeliverableStatus } from "@/lib/types";
import type { PhaseFilter, StatusFilter } from "@/lib/types/deliverables-types";

type DeliverablesFiltersProps = {
  phases: Phase[];

  query: string;
  onQueryChange: (value: string) => void;

  phaseFilter: PhaseFilter;
  onPhaseFilterChange: (value: PhaseFilter) => void;

  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
};

export function DeliverablesFilters({
  phases,
  query,
  onQueryChange,
  phaseFilter,
  onPhaseFilterChange,
  statusFilter,
  onStatusFilterChange,
}: DeliverablesFiltersProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState(query);

  const statusItems = useMemo(() => Object.values(DeliverableStatus), []);

  const handleClear = () => {
    setSearchValue("");
    onQueryChange("");
    inputRef.current?.focus();
  };

  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative">
        <Input
          aria-label="Search deliverables"
          className={`peer min-w-80 ps-9 ${searchValue ? "pe-9" : ""}`}
          id={`${id}-search`}
          onChange={(e) => {
            setSearchValue(e.target.value);
            onQueryChange(e.target.value);
          }}
          placeholder="Search deliverables"
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
            onClick={handleClear}
            type="button"
          >
            <CircleXIcon aria-hidden="true" size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Select
          onValueChange={(value) => onPhaseFilterChange(value)}
          value={phaseFilter}
        >
          <SelectTrigger className="w-full sm:w-fit">
            <SelectValue placeholder="All phases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All phases</SelectItem>
            {phases.map((phase) => (
              <SelectItem key={phase.id} value={phase.id}>
                {/* {phase.name} */}
                <StatusBadge status={phase.type} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) =>
            onStatusFilterChange(
              value === "ALL" ? "ALL" : (value as DeliverableStatus)
            )
          }
          value={statusFilter}
        >
          <SelectTrigger className="w-full sm:w-fit">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {statusItems.map((status) => (
              <SelectItem key={status} value={status}>
                {/* {formatTitleCase(status)} */}
                <StatusBadge status={status} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
