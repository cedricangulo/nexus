/**
 * Meeting Analytics Components
 *
 * Summary cards for Team Lead dashboard providing key metrics:
 * - Total Meetings: Count of all documented meetings
 * - Coverage: % of sprints/phases with documented meetings
 * - On-Time: % of meetings documented before sprint/phase end date
 * - Missing: Count of sprints/phases without documented meetings
 *
 * Each card is split into:
 * - Card wrapper (UI shell, cacheable)
 * - Data component (async, fetches its own data)
 */

export { TotalMeetings, TotalMeetingsCard } from "./total-meetings-card";
export { Coverage, CoverageCard } from "./coverage-card";
export { OnTime, OnTimeCard } from "./on-time-card";
export { MissingMeetings, MissingMeetingsCard } from "./missing-meetings-card";
export { MobileSummary, SUMMARY_ITEMS, SummaryCardItem } from "./mobile-summary";
