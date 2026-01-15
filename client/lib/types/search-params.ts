import { 
  createSearchParamsCache, 
  parseAsString, 
  parseAsStringEnum 
} from "nuqs/server";
import { DeliverableStatus, PhaseType, TaskStatus } from "@/lib/types";

export const deliverableParsers = {
  // Search query (e.g. ?query=design)
  query: parseAsString.withDefault(""),
  
  // Phase Type (e.g. ?phase=SCRUM or ?phase=ALL)
  phase: parseAsStringEnum<PhaseType | "ALL">([
    ...Object.values(PhaseType),
    "ALL"
  ]).withDefault("ALL"),

  // Status (e.g. ?status=IN_PROGRESS or ?status=ALL)
  status: parseAsStringEnum<DeliverableStatus | "ALL">([
    ...Object.values(DeliverableStatus), 
    "ALL"
  ]).withDefault("ALL"),
};

export const searchParamsCache = createSearchParamsCache(deliverableParsers);

// Sprint status type for filtering
export type SprintStatusFilter = "ALL" | "ACTIVE" | "PLANNED" | "COMPLETED";

export const sprintParsers = {
  // Search query (e.g. ?query=sprint)
  query: parseAsString.withDefault(""),
  
  // Sprint status (e.g. ?status=ACTIVE or ?status=ALL)
  status: parseAsStringEnum<SprintStatusFilter>([
    "ALL",
    "ACTIVE", 
    "PLANNED",
    "COMPLETED"
  ]).withDefault("ALL"),

  // Date range filters (e.g. ?startDate=2024-01-01&endDate=2024-12-31)
  startDate: parseAsString.withDefault(""),
  endDate: parseAsString.withDefault(""),
};

export const sprintSearchParamsCache = createSearchParamsCache(sprintParsers);

// Task sort options for adviser view
export type TaskSortBy = "createdAt" | "title" | "assigneeCount";
export type TaskSortOrder = "asc" | "desc";

export const adviserTaskParsers = {
  // Assignee filter (e.g. ?assignee=userId or ?assignee=ALL or ?assignee=UNASSIGNED)
  assignee: parseAsString.withDefault("ALL"),

  // Sort by field (e.g. ?sortBy=createdAt)
  sortBy: parseAsStringEnum<TaskSortBy>([
    "createdAt",
    "title",
    "assigneeCount"
  ]).withDefault("createdAt"),

  // Sort order (e.g. ?sortOrder=desc)
  sortOrder: parseAsStringEnum<TaskSortOrder>([
    "asc",
    "desc"
  ]).withDefault("desc"),
};

export const adviserTaskSearchParamsCache = createSearchParamsCache(adviserTaskParsers);
