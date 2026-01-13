import { Command } from "cmdk";
import type { SearchResults as SearchResultsType } from "@/lib/types/search";
import { SearchResultItem } from "./search-item";

/**
 * Props for SearchResults component
 */
type SearchResultsProps = {
  /** Search results data from API */
  results: SearchResultsType | null;
  /** Callback when user selects a result */
  onSelect: (path: string) => void;
  /** Whether search is currently in progress */
  isLoading: boolean;
  /** Whether to show empty state */
  showEmpty: boolean;
};

/**
 * Renders grouped search results with appropriate empty/loading states
 *
 * Organizes results into four groups (Tasks, Deliverables, Comments, Meeting Logs)
 * and delegates individual result rendering to SearchResultItem.
 *
 * Performance considerations:
 * - Only renders groups that have results
 * - Uses SearchResultItem memoization to prevent unnecessary re-renders
 * - Conditional rendering keeps DOM minimal
 *
 * @param results - Search results grouped by entity type
 * @param onSelect - Navigation callback when user selects a result
 * @param isLoading - Shows loading indicator
 * @param showEmpty - Shows empty state when no results found
 */
export function SearchResults({
  results,
  onSelect,
  isLoading,
  showEmpty,
}: SearchResultsProps) {
  return (
    <Command.List className="max-h-100 overflow-y-auto px-2 pb-2">
      {isLoading && (
        <div className="py-6 text-center text-muted-foreground text-sm">
          Searching...
        </div>
      )}

      {showEmpty && (
        <Command.Empty className="py-6 text-center text-muted-foreground text-sm">
          No results found.
        </Command.Empty>
      )}

      {/* Tasks Group */}
      {results && results.tasks.length > 0 && (
        <Command.Group
          className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground **:[[cmdk-group-heading]]:text-xs"
          heading="Tasks"
        >
          {results.tasks.map((task) => (
            <SearchResultItem
              data={task}
              key={task.id}
              onSelect={onSelect}
              type="task"
            />
          ))}
        </Command.Group>
      )}

      {/* Deliverables Group */}
      {results && results.deliverables.length > 0 && (
        <Command.Group
          className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground **:[[cmdk-group-heading]]:text-xs"
          heading="Deliverables"
        >
          {results.deliverables.map((deliverable) => (
            <SearchResultItem
              data={deliverable}
              key={deliverable.id}
              onSelect={onSelect}
              type="deliverable"
            />
          ))}
        </Command.Group>
      )}

      {/* Comments Group */}
      {results && results.comments.length > 0 && (
        <Command.Group
          className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground **:[[cmdk-group-heading]]:text-xs"
          heading="Comments"
        >
          {results.comments.map((comment) => (
            <SearchResultItem
              data={comment}
              key={comment.id}
              onSelect={onSelect}
              type="comment"
            />
          ))}
        </Command.Group>
      )}

      {/* Meeting Logs Group */}
      {results && results.meetingLogs.length > 0 && (
        <Command.Group
          className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground **:[[cmdk-group-heading]]:text-xs"
          heading="Meeting Logs"
        >
          {results.meetingLogs.map((log) => (
            <SearchResultItem
              data={log}
              key={log.id}
              onSelect={onSelect}
              type="meeting"
            />
          ))}
        </Command.Group>
      )}
    </Command.List>
  );
}
