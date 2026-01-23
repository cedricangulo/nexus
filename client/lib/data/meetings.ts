import { cache } from "react";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getApiClient } from "@/lib/api/server-client";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";

export type MeetingsPageData = {
	logs: MeetingLog[];
	sprints: Sprint[];
	phases: Phase[];
	totalExpected: number;
};

export type MeetingFilters = {
	query?: string;
	scope?: string[];
};

export type ScopeCounts = {
	Sprint: number;
	Phase: number;
};

export type FilteredMeetingsData = MeetingsPageData & {
	scopeCounts: ScopeCounts;
};

/**
 * Fetch all meeting logs and calculate metrics
 * Token must be passed from dynamic page layer
 *
 * Aggregates meeting logs from all sprints and phases
 * totalExpected is the number of sprints (since meetings are linked to sprints)
 *
 * @returns Object containing logs and totalExpected count
 * @throws Error if data fetching fails
 */
export const getMeetingsData = cache(
	async (token: string): Promise<MeetingsPageData> => {
		try {
			const api = await getApiClient(token);

			// Fetch sprints and phases in parallel
			const [sprintsResponse, phasesResponse] = await Promise.all([
				api.get<Sprint[]>(API_ENDPOINTS.SPRINTS.LIST),
				api.get<Phase[]>(API_ENDPOINTS.PHASES.LIST),
			]);

			const sprints = sprintsResponse.data;
			const phases = phasesResponse.data;

			// Collect all meeting logs from sprints and phases in parallel
			const allLogsPromises = await Promise.all([
				...sprints.map((sprint) =>
					api
						.get<MeetingLog[]>(API_ENDPOINTS.MEETING_LOGS.BY_SPRINT(sprint.id))
						.then((res) => res.data)
						.catch(() => []),
				),
				...phases.map((phase) =>
					api
						.get<MeetingLog[]>(API_ENDPOINTS.MEETING_LOGS.BY_PHASE(phase.id))
						.then((res) => res.data)
						.catch(() => []),
				),
			]);

			const logs = allLogsPromises.flat();
			const totalExpected = sprints.length;

			return {
				logs,
				sprints,
				phases,
				totalExpected,
			};
		} catch (error) {
			console.error("Failed to fetch meetings data:", error);
			return {
				logs: [],
				sprints: [],
				phases: [],
				totalExpected: 0,
			};
		}
	},
);

/**
 * Build context label for a meeting log
 */
function buildContextLabel(
	log: MeetingLog,
	sprints: Sprint[],
	phases: Phase[],
): string {
	if (log.sprintId) {
		const sprint = sprints.find((s) => s.id === log.sprintId);
		return sprint ? `Sprint ${sprint.number}` : "Sprint";
	}
	if (log.phaseId) {
		const phase = phases.find((p) => p.id === log.phaseId);
		return phase?.name ?? "Phase";
	}
	return "Unassigned";
}

/**
 * Get filtered meeting logs based on search params
 * Applies server-side filtering and calculates dynamic faceted counts
 *
 * @param token - Authentication token
 * @param filters - Filter criteria (query, scope)
 * @returns Filtered logs with dynamic scope counts
 */
export const getFilteredMeetingsData = cache(
	async (
		token: string,
		filters: MeetingFilters,
	): Promise<FilteredMeetingsData> => {
		const { logs, sprints, phases, totalExpected } =
			await getMeetingsData(token);

		let filtered = logs;

		// Apply search query filter (search across multiple fields)
		if (filters.query) {
			const query = filters.query.toLowerCase();
			filtered = filtered.filter((log) => {
				const contextLabel = buildContextLabel(log, sprints, phases);
				return (
					log.title.toLowerCase().includes(query) ||
					contextLabel.toLowerCase().includes(query) ||
					log.uploader?.name.toLowerCase().includes(query) ||
					log.uploader?.email.toLowerCase().includes(query)
				);
			});
		}

		// Calculate dynamic scope counts from query-filtered data
		// (before applying scope filter)
		const queryFilteredLogs = filtered;

		// Apply scope filter
		if (filters.scope && filters.scope.length > 0) {
			filtered = filtered.filter((log) => {
				if (log.sprintId && filters.scope?.includes("Sprint")) return true;
				if (log.phaseId && filters.scope?.includes("Phase")) return true;
				return false;
			});
		}

		// Calculate dynamic faceted counts based on query-filtered data
		const scopeCounts: ScopeCounts = {
			Sprint: queryFilteredLogs.filter((log) => log.sprintId).length,
			Phase: queryFilteredLogs.filter((log) => log.phaseId).length,
		};

		return {
			logs: filtered,
			sprints,
			phases,
			totalExpected,
			scopeCounts,
		};
	},
);

/**
 * Get total meetings count for analytics card
 * @param token - Authentication token
 * @param filters - Filter criteria
 * @returns Total count of filtered meetings
 */
export const getTotalMeetingsData = cache(
	async (token: string, filters: MeetingFilters): Promise<number> => {
		const { logs } = await getFilteredMeetingsData(token, filters);
		return logs.length;
	},
);

/**
 * Get coverage data for analytics card
 * @param token - Authentication token
 * @param filters - Filter criteria
 * @returns Coverage percentage and counts
 */
export const getCoverageData = cache(
	async (
		token: string,
		filters: MeetingFilters,
	): Promise<{ percentage: number; covered: number; total: number }> => {
		const { logs, sprints, phases } = await getFilteredMeetingsData(
			token,
			filters,
		);

		const validSprints = sprints.filter(
			(s) => !s.deletedAt && s.startDate && s.endDate,
		);
		const validPhases = phases.filter((p) => p.startDate && p.endDate);
		const total = validSprints.length + validPhases.length;

		if (total === 0) {
			return { percentage: 0, covered: 0, total: 0 };
		}

		const sprintsWithMeetings = new Set<string>();
		const phasesWithMeetings = new Set<string>();

		for (const log of logs) {
			if (log.sprintId && validSprints.some((s) => s.id === log.sprintId)) {
				sprintsWithMeetings.add(log.sprintId);
			}
			if (log.phaseId && validPhases.some((p) => p.id === log.phaseId)) {
				phasesWithMeetings.add(log.phaseId);
			}
		}

		const covered = sprintsWithMeetings.size + phasesWithMeetings.size;
		const percentage = Math.round((covered / total) * 100);

		return { percentage, covered, total };
	},
);

/**
 * Get on-time percentage data for analytics card
 * @param token - Authentication token
 * @param filters - Filter criteria
 * @returns On-time percentage and counts
 */
export const getOnTimeData = cache(
	async (
		token: string,
		filters: MeetingFilters,
	): Promise<{ percentage: number; onTime: number; total: number }> => {
		const { logs, sprints, phases } = await getFilteredMeetingsData(
			token,
			filters,
		);

		const validSprints = sprints.filter(
			(s) => !s.deletedAt && s.startDate && s.endDate,
		);
		const validPhases = phases.filter((p) => p.startDate && p.endDate);
		const total = logs.length;

		if (total === 0) {
			return { percentage: 0, onTime: 0, total: 0 };
		}

		let onTimeCount = 0;

		for (const log of logs) {
			const uploadedAt = new Date(log.createdAt).getTime();

			if (log.sprintId) {
				const sprint = validSprints.find((s) => s.id === log.sprintId);
				if (sprint?.endDate) {
					const sprintEndDate = new Date(sprint.endDate).getTime();
					if (uploadedAt <= sprintEndDate) {
						onTimeCount += 1;
						continue;
					}
				}
			}

			if (log.phaseId) {
				const phase = validPhases.find((p) => p.id === log.phaseId);
				if (phase?.endDate) {
					const phaseEndDate = new Date(phase.endDate).getTime();
					if (uploadedAt <= phaseEndDate) {
						onTimeCount += 1;
					}
				}
			}
		}

		const percentage = Math.round((onTimeCount / total) * 100);

		return { percentage, onTime: onTimeCount, total };
	},
);

/**
 * Get missing meetings data for analytics card
 * @param token - Authentication token
 * @param filters - Filter criteria
 * @returns Missing meetings count and details
 */
export const getMissingMeetingsData = cache(
	async (
		token: string,
		filters: MeetingFilters,
	): Promise<{
		count: number;
		sprints: Sprint[];
		phases: Phase[];
	}> => {
		const { logs, sprints, phases } = await getFilteredMeetingsData(
			token,
			filters,
		);

		const validSprints = sprints.filter(
			(s) => !s.deletedAt && s.startDate && s.endDate,
		);
		const validPhases = phases.filter((p) => p.startDate && p.endDate);

		const sprintsWithMeetings = new Set(
			logs.map((log) => log.sprintId).filter(Boolean),
		);
		const phasesWithMeetings = new Set(
			logs.map((log) => log.phaseId).filter(Boolean),
		);

		const missingSprintsArray = validSprints.filter(
			(s) => !sprintsWithMeetings.has(s.id),
		);
		const missingPhasesArray = validPhases.filter(
			(p) => !phasesWithMeetings.has(p.id),
		);

		const count = missingSprintsArray.length + missingPhasesArray.length;

		return { count, sprints: missingSprintsArray, phases: missingPhasesArray };
	},
);
