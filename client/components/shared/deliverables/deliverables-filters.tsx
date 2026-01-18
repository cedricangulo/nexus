"use client";

import { CircleXIcon, ListFilterIcon } from "lucide-react";
import { useId, useRef } from "react";
import { useQueryStates } from "nuqs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status";
import { DeliverableStatus, PhaseType } from "@/lib/types";
import { deliverableParsers } from "@/lib/types/search-params";

const STATUS_OPTIONS = Object.values(DeliverableStatus);
const PHASE_OPTIONS = Object.values(PhaseType);

export function DeliverablesFilters() {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useQueryStates(deliverableParsers, {
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

  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative">
        <Input
          aria-label="Search deliverables"
          className={`peer min-w-80 ps-9 ${filters.query ? "pe-9" : ""}`}
          id={`${id}-search`}
          onChange={handleSearchChange}
          placeholder="Search deliverables..."
          ref={inputRef}
          type="text"
          value={filters.query}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <ListFilterIcon aria-hidden="true" size={16} />
        </div>
        {!filters.query ? null : (
          <button
            aria-label="Clear search filter"
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleClearSearch}
            type="button"
          >
            <CircleXIcon aria-hidden="true" size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Select
          onValueChange={(value) => setFilters({ phase: value as any })}
          value={filters.phase}
        >
          <SelectTrigger className="w-full sm:w-fit">
            <SelectValue placeholder="All phases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All phases</SelectItem>
            {PHASE_OPTIONS.map((phaseType) => (
              <SelectItem key={phaseType} value={phaseType}>
                <StatusBadge status={phaseType} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => setFilters({ status: value as any })}
          value={filters.status}
        >
          <SelectTrigger className="w-full sm:w-fit">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                <StatusBadge status={status} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
