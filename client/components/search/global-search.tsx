"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearch } from "@/hooks/use-search";
import type { User } from "@/lib/types";
import { SearchResults } from "./search-results";

/**
 * Props for GlobalSearch component
 */
type GlobalSearchProps = {
  /** Controls dialog open/closed state */
  open: boolean;
  /** Callback to change dialog state */
  onOpenChange: (open: boolean) => void;
  /** Current user (used for role-aware search filtering) */
  user?: User | null;
};

/**
 * Global search command palette dialog
 *
 * Provides a keyboard-accessible search interface (Cmd/Ctrl+K) for finding
 * tasks, deliverables, comments, and meeting logs across the application.
 *
 * Architecture:
 * - useSearch hook: Manages search state, debouncing, and API calls
 * - SearchResults: Renders grouped results with proper empty/loading states
 * - SearchResultItem: Individual memoized result items (via SearchResults)
 *
 * Features:
 * - Debounced search (400ms) with AbortController for request cancellation
 * - Keyboard navigation via cmdk (up/down arrows, enter to select)
 * - Backdrop click and cancel button to close
 * - Auto-focuses input when opened
 * - Resets state when closed
 * - Role-aware filtering (members see only assigned items)
 *
 * Performance:
 * - startTransition keeps input responsive during result updates
 * - Memoized result items prevent unnecessary re-renders
 * - AbortController prevents race conditions from overlapping requests
 *
 * Accessibility:
 * - VisuallyHidden title/description for screen readers
 * - Keyboard shortcuts (Cmd/Ctrl+K)
 * - aria-labels on interactive elements
 * - Proper focus management
 */
export function GlobalSearch({ open, onOpenChange, user }: GlobalSearchProps) {
  const router = useRouter();
  const { search, setSearch, results, isLoading } = useSearch(open, user);

  /**
   * Handle result selection
   * Closes dialog and navigates to the selected item's page
   */
  const handleSelect = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  // Calculate total results for empty state
  const totalResults =
    (results?.tasks.length || 0) +
    (results?.deliverables.length || 0) +
    (results?.comments.length || 0) +
    (results?.meetingLogs.length || 0);

  const showEmpty = search.length >= 2 && !isLoading && totalResults === 0;

  return (
    <Command.Dialog
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10%]"
      label="Global Search"
      onOpenChange={onOpenChange}
      open={open}
    >
      {/* Backdrop overlay with blur effect */}
      <DialogOverlay
        aria-hidden="true"
        className="fixed inset-0 z-0"
        onClick={() => onOpenChange(false)}
      />

      {/* Hidden accessibility labels for screen readers */}
      <VisuallyHidden.Root>
        <DialogTitle>Global Search</DialogTitle>
        <DialogDescription>
          Search for tasks, deliverables, comments, and meeting logs.
        </DialogDescription>
      </VisuallyHidden.Root>

      {/* Main dialog content */}
      <div className="fade-in-0 zoom-in-95 relative w-full max-w-2xl animate-in overflow-hidden rounded-lg border bg-popover shadow-lg duration-200">
        {/* Cancel button in top-right corner */}
        <Button
          aria-label="Close search"
          className="absolute top-2 right-2 z-10"
          onClick={() => onOpenChange(false)}
          size="sm"
          type="button"
          variant="outline"
        >
          Cancel
        </Button>

        {/* Search input */}
        <div className="flex items-center border-b px-3">
          <Command.Input
            autoFocus
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            onValueChange={setSearch}
            placeholder="Search tasks, deliverables, comments, meeting logs..."
            value={search}
          />
        </div>

        {/* Results list - delegated to SearchResults component */}
        <SearchResults
          isLoading={isLoading}
          onSelect={handleSelect}
          results={results}
          showEmpty={showEmpty}
        />
      </div>
    </Command.Dialog>
  );
}
