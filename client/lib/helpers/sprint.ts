import type { Phase, PhaseType, Sprint, TaskStatus } from "@/lib/types";
import { PhaseType as PhaseTypeEnum } from "@/lib/types";

export type SprintStatus = "ACTIVE" | "UPCOMING" | "COMPLETED" | "OVERDUE";

/**
 * Determine sprint status based on current date and sprint dates
 * - UPCOMING: Sprint hasn't started yet (now < startDate)
 * - ACTIVE: Sprint is in progress (startDate <= now <= endDate)
 * - OVERDUE: Sprint has ended (now > endDate)
 * - COMPLETED: Same as OVERDUE (for UI compatibility)
 */
export function getSprintStatus(
	sprint: {
		startDate: string;
		endDate: string;
	},
	now: Date = new Date(),
): SprintStatus {
	const start = new Date(sprint.startDate);
	const end = new Date(sprint.endDate);

	if (now < start) {
		return "UPCOMING";
	}

	if (now > end) {
		return "OVERDUE";
	}

	return "ACTIVE";
}

/**
 * Assign a sprint to a WSF phase based on sprint start date and phase date ranges.
 * Falls back to quartile distribution when phase dates are not configured.
 */
export function getPhaseTypeForSprint(
	sprint: Sprint,
	phases: Phase[],
	sortedByStartAsc: Sprint[],
): PhaseType {
	const sprintStart = new Date(sprint.startDate);

	const phasesWithDates = phases.filter((p) =>
		Boolean(p.startDate && p.endDate),
	);
	if (phasesWithDates.length > 0) {
		for (const phase of phasesWithDates) {
			const phaseStart = new Date(phase.startDate as string);
			const phaseEnd = new Date(phase.endDate as string);
			if (sprintStart >= phaseStart && sprintStart <= phaseEnd) {
				return phase.type;
			}
		}
	}

	// Fallback grouping when phase dates are not configured.
	// This keeps the UI usable in seed and early setup states.
	const index = sortedByStartAsc.findIndex((s) => s.id === sprint.id);
	const total = Math.max(sortedByStartAsc.length, 1);
	const waterfallCutoff = Math.ceil(total * 0.25);
	const fallCutoff = Math.floor(total * 0.75);

	if (index < waterfallCutoff) {
		return PhaseTypeEnum.WATERFALL;
	}
	if (index >= fallCutoff) {
		return PhaseTypeEnum.FALL;
	}
	return PhaseTypeEnum.SCRUM;
}

/**
 * Map sprint status to task status for badge display
 */
export function mapSprintStatusToTaskStatus(
	sprintStatus: "ACTIVE" | "UPCOMING" | "COMPLETED" | "OVERDUE",
): TaskStatus {
	switch (sprintStatus) {
		case "ACTIVE":
			return "IN_PROGRESS";
		case "UPCOMING":
			return "TODO";
		case "COMPLETED":
			return "DONE";
		case "OVERDUE":
			return "BLOCKED";
		default:
			return "TODO";
	}
}
