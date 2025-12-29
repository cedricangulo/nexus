"use client";

import type { useReactTable } from "@tanstack/react-table";
import {
  CircleXIcon,
  Columns3Icon,
  FilterIcon,
  ListFilterIcon,
} from "lucide-react";
import { useId, useRef } from "react";
import type { MeetingsTableRow } from "@/components/shared/meetings/table";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Phase, Sprint } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UploadMinutesButton } from "../../../team-lead/meetings/upload-button";

/**
 * Inline Meetings Table Filters
 * Handles search, scope filtering, and column visibility
 */
export function MeetingsFilters({
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
        <div className="relative w-full md:w-fit">
          <Input
            aria-label="Filter meeting minutes"
            className={cn(
              "peer w-full ps-9 md:max-w-80",
              searchValue && "pe-9"
            )}
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
            <Button className="w-full md:w-fit" variant="outline">
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
          <PopoverContent align="center" className="w-auto min-w-36 p-3">
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
            <Button className="w-full md:w-fit" variant="outline">
              <Columns3Icon
                aria-hidden="true"
                className="-ms-1 opacity-60"
                size={16}
              />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
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
