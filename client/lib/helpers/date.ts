/**
 * Date Helper Functions
 * Centralized utilities for date transformations and formatting
 */

/**
 * Convert date or datetime string to ISO datetime format (YYYY-MM-DDTHH:MM:SSZ)
 * Server expects full ISO datetime with timezone
 *
 * @param dateString - Date in YYYY-MM-DD or datetime-local format (YYYY-MM-DDTHH:mm)
 * @returns ISO datetime string or undefined if input is empty/undefined
 *
 * @example
 * toISODateTime("2025-01-17") // "2025-01-17T12:00:00Z"
 * toISODateTime("2025-01-17T14:30") // "2025-01-17T14:30:00Z"
 * toISODateTime("") // undefined
 * toISODateTime(undefined) // undefined
 */
export function toISODateTime(
  dateString: string | undefined | null
): string | undefined {
  if (!dateString || dateString === "") {
    return;
  }

  // If already in full ISO format with timezone, return as is
  if (dateString.includes("Z") || dateString.match(/[+-]\d{2}:\d{2}$/)) {
    return dateString;
  }

  // Handle datetime-local format (YYYY-MM-DDTHH:mm)
  if (dateString.includes("T")) {
    // Add seconds if not present
    const parts = dateString.split("T");
    const timePart = parts[1];
    const timeWithSeconds =
      timePart.includes(":") && timePart.split(":").length === 2
        ? `${timePart}:00`
        : timePart;
    return `${parts[0]}T${timeWithSeconds}Z`;
  }

  // Convert YYYY-MM-DD to noon UTC (12:00:00Z) to avoid timezone display issues
  // Using noon instead of midnight prevents dates from shifting to previous/next day
  return `${dateString}T12:00:00Z`;
}

/**
 * Convert date string to ISO datetime or null for database storage
 * Use this when the API expects null for empty dates
 *
 * @param dateString - Date in YYYY-MM-DD format or empty string
 * @returns ISO datetime string or null if input is empty/undefined
 */
export function toISODateTimeOrNull(
  dateString: string | undefined | null
): string | null {
  return toISODateTime(dateString) ?? null;
}

/**
 * Get current datetime formatted for datetime-local input (YYYY-MM-DDTHH:mm)
 * This format is required by HTML5 datetime-local inputs
 *
 * @returns Current datetime in YYYY-MM-DDTHH:mm format
 *
 * @example
 * getCurrentDateTimeLocal() // "2025-12-31T14:30"
 */
export function getCurrentDateTimeLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get current date in YYYY-MM-DD format
 * Used for date-only inputs like meeting dates
 *
 * @returns Current date in YYYY-MM-DD format
 *
 * @example
 * getCurrentDate() // "2025-12-31"
 */
export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Extract date-only portion from ISO datetime or date string
 *
 * @param value - ISO datetime or date string
 * @returns Date in YYYY-MM-DD format or empty string
 *
 * @example
 * toDateOnly("2025-01-17T10:30:00Z") // "2025-01-17"
 * toDateOnly("2025-01-17") // "2025-01-17"
 * toDateOnly(null) // ""
 */
export function toDateOnly(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  // Accept either YYYY-MM-DD or full ISO datetime, normalize to YYYY-MM-DD
  return value.length >= 10 ? value.slice(0, 10) : value;
}

/**
 * Clean date input for form submission
 * Converts empty strings to undefined to avoid sending empty values to the server
 *
 * @param dateString - Date string from form input
 * @returns Cleaned date string or undefined
 */
export function cleanDateInput(
  dateString: string | undefined
): string | undefined {
  if (!dateString || dateString.trim() === "") {
    return;
  }
  return dateString;
}
