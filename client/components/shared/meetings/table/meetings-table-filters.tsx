"use client";

import type { useReactTable } from "@tanstack/react-table";
import { CircleXIcon, Columns3Icon, FilterIcon, Search } from "lucide-react";
import { useQueryStates } from "nuqs";
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
import type { ScopeCounts } from "@/lib/data/meetings";
import type { Phase, Sprint } from "@/lib/types";
import { meetingParsers } from "@/lib/types/search-params";
import { cn } from "@/lib/utils";
import { useIsContributor } from "@/providers/auth-context-provider";
import { UploadMinutesButton } from "../upload-button";

/**
 * Inline Meetings Table Filters
 * Handles search, scope filtering (via nuqs), and column visibility
 */
export function MeetingsTableFilters({
	table,
	scopeCounts,
	sprints,
	phases,
}: {
	table?: ReturnType<typeof useReactTable<MeetingsTableRow>>;
	scopeCounts: ScopeCounts;
	sprints: Sprint[];
	phases: Phase[];
}) {
	const filterId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const isContributor = useIsContributor();

	// URL state management with nuqs
	const [filters, setFilters] = useQueryStates(meetingParsers, {
		shallow: false,
		throttleMs: 300,
	});

	const searchValue = filters.query;
	const selectedScopes = filters.scope;

	const handleScopeChange = (checked: boolean, value: string) => {
		const newScopes = checked
			? [...selectedScopes, value]
			: selectedScopes.filter((s) => s !== value);
		setFilters({ scope: newScopes.length ? newScopes : [] });
	};

	const handleResetFilters = () => {
		setFilters({ query: "", scope: [] });
	};

	return (
		<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div className="flex flex-wrap items-center gap-4">
				{/* Search Filter */}
				<div className="relative w-full md:w-fit">
					<Input
						aria-label="Filter meeting minutes"
						className={cn(
							"peer w-full ps-9 md:max-w-80",
							searchValue && "pe-9",
						)}
						id={`${filterId}-search`}
						onChange={(e) => setFilters({ query: e.target.value })}
						placeholder="Search by title, uploader, sprint, phase..."
						ref={inputRef}
						type="text"
						value={searchValue}
					/>
					<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
						<Search aria-hidden="true" size={16} />
					</div>
					{searchValue ? (
						<button
							aria-label="Clear search filter"
							className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
							onClick={() => {
								setFilters({ query: "" });
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
								{["Sprint", "Phase"].map((value, i) => {
									const count = scopeCounts[value as keyof ScopeCounts] ?? 0;
									return (
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
												<span className="ms-2 text-muted-foreground text-xs">
													({count})
												</span>
											</Label>
										</div>
									);
								})}
							</div>
						</div>
					</PopoverContent>
				</Popover>

				{/* Column Visibility Toggle */}
				{table ? (
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
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
										onSelect={(event) => event.preventDefault()}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								))}
						</DropdownMenuContent>
					</DropdownMenu>
				) : null}

				{/* Reset Filters Button */}
				{(searchValue || selectedScopes.length > 0) && (
					<Button
						className="w-full md:w-fit"
						onClick={handleResetFilters}
						variant="outline"
					>
						<CircleXIcon
							aria-hidden="true"
							className="-ms-1 opacity-60"
							size={16}
						/>
						Reset filters
					</Button>
				)}
			</div>

			{/* Upload Minutes Button */}
			{isContributor ? (
				<UploadMinutesButton phases={phases} sprints={sprints} />
			) : null}
		</div>
	);
}
