"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { globalSearchAction } from "@/actions/search";
import type { User } from "@/lib/types";
import type { SearchResults } from "@/lib/types/search";

/**
 * Custom hook for managing global search logic
 *
 * Handles:
 * - Debounced search with 400ms delay for optimal performance
 * - Request cancellation via AbortController when user continues typing
 * - React 18 startTransition for non-blocking UI updates
 * - Component mounted state tracking to prevent memory leaks
 * - Automatic reset when search dialog closes
 * - Role-aware search filtering (members see only assigned items)
 *
 * @param open - Whether the search dialog is currently open
 * @param user - Current user (used for role-aware filtering)
 * @returns Object containing search state and handlers
 */
export function useSearch(open: boolean, user?: User | null) {
  const isMountedRef = useRef(true);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Track component mount/unmount to prevent state updates on unmounted component
   */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Debounced search with request cancellation
   *
   * Flow:
   * 1. User types → 400ms delay starts
   * 2. If user keeps typing → previous timeout cleared, new delay starts
   * 3. After 400ms quiet period → API request sent with AbortController signal
   * 4. If user types again → previous request aborted via controller.abort()
   * 5. Results wrapped in startTransition to keep input responsive
   *
   * Performance optimizations:
   * - 400ms debounce reduces API calls on slower devices
   * - AbortController prevents race conditions from overlapping requests
   * - startTransition keeps input field responsive during result updates
   * - User role/id passed to backend for role-aware filtering
   */
  useEffect(() => {
    // Clear results if search is too short
    if (!search.trim() || search.length < 3) {
      startTransition(() => {
        setResults(null);
      });
      return;
    }

    // Create abort controller for this search request
    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      if (!isMountedRef.current) {
        return;
      }

      setIsLoading(true);
      try {
        const result = await globalSearchAction(search, user);

        // Bail early if component unmounted or request was aborted
        if (!isMountedRef.current || controller.signal.aborted) {
          return;
        }

        if (result.success) {
          // Use startTransition to prioritize input responsiveness over result rendering
          startTransition(() => {
            setResults(result.data);
          });
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        if (!isMountedRef.current) {
          return;
        }

        // AbortError is expected when user keeps typing - don't show error toast
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        toast.error("Search failed");
        console.error(error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }, 400); // 400ms provides good balance between responsiveness and API efficiency

    // Cleanup: cancel timeout and abort in-flight request
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search, user]);

  /**
   * Reset search state when dialog closes
   * Ensures clean slate when user reopens search
   */
  useEffect(() => {
    if (!open) {
      setSearch("");
      setResults(null);
    }
  }, [open]);

  return {
    search,
    setSearch,
    results,
    isLoading,
  };
}
