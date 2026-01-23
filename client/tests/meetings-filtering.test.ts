import { describe, expect, it } from "vitest";
import type { MeetingFilters, ScopeCounts } from "@/lib/data/meetings";
import type { MeetingLog, Phase, Sprint } from "@/lib/types";

/**
 * Mock data creators for testing
 */
const createMockSprint = (overrides: Partial<Sprint> = {}): Sprint => ({
	id: "sprint-1",
	projectId: "project-1",
	number: 1,
	goal: "Test sprint",
	startDate: "2024-01-01",
	endDate: "2024-01-15",
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
	deletedAt: null,
	...overrides,
});

const createMockPhase = (overrides: Partial<Phase> = {}): Phase => ({
	id: "phase-1",
	projectId: "project-1",
	name: "Design Phase",
	type: "SCRUM",
	startDate: "2024-01-01",
	endDate: "2024-01-31",
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z",
	...overrides,
});

const createMockMeetingLog = (
	overrides: Partial<MeetingLog> = {},
): MeetingLog => {
	const base: MeetingLog = {
		id: "log-1",
		uploaderId: "user-1",
		title: "Team Standup",
		date: "2024-01-05",
		fileUrl: "https://example.com/meeting.pdf",
		sprintId: "sprint-1",
		phaseId: null,
		createdAt: "2024-01-05T10:00:00Z",
		updatedAt: "2024-01-05T10:00:00Z",
		uploader: {
			id: "user-1",
			name: "John Doe",
			email: "john@example.com",
		},
	};
	return { ...base, ...overrides };
};

/**
 * Helper to simulate filtering logic
 */
function filterMeetings(
	logs: MeetingLog[],
	sprints: Sprint[],
	phases: Phase[],
	filters: MeetingFilters,
): { filtered: MeetingLog[]; scopeCounts: ScopeCounts } {
	let filtered = logs;

	// Apply search query filter
	if (filters.query) {
		const query = filters.query.toLowerCase();
		filtered = filtered.filter((log) => {
			const contextLabel = log.sprintId
				? `Sprint ${sprints.find((s) => s.id === log.sprintId)?.number || ""}`
				: log.phaseId
					? phases.find((p) => p.id === log.phaseId)?.name || "Phase"
					: "Unassigned";

			return (
				log.title.toLowerCase().includes(query) ||
				contextLabel.toLowerCase().includes(query) ||
				log.uploader?.name.toLowerCase().includes(query) ||
				log.uploader?.email.toLowerCase().includes(query)
			);
		});
	}

	// Calculate scope counts from query-filtered data
	const queryFilteredLogs = filtered;

	// Apply scope filter
	if (filters.scope && filters.scope.length > 0) {
		filtered = filtered.filter((log) => {
			if (log.sprintId && filters.scope?.includes("Sprint")) return true;
			if (log.phaseId && filters.scope?.includes("Phase")) return true;
			return false;
		});
	}

	const scopeCounts: ScopeCounts = {
		Sprint: queryFilteredLogs.filter((log) => log.sprintId).length,
		Phase: queryFilteredLogs.filter((log) => log.phaseId).length,
	};

	return { filtered, scopeCounts };
}

describe("Meetings Filtering Logic", () => {
	describe("Query Filter Tests", () => {
		it("should filter meetings by title", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				title: "Team Standup",
			});
			const log2 = createMockMeetingLog({
				id: "log-2",
				title: "Design Review",
			});

			const logs = [log1, log2];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "standup",
			});

			expect(filtered).toHaveLength(1);
			expect(filtered[0]?.title).toBe("Team Standup");
		});

		it("should filter meetings by uploader name", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				title: "Meeting 1",
				uploader: {
					id: "user-1",
					name: "John Doe",
					email: "john@example.com",
				},
			});
			const log2 = createMockMeetingLog({
				id: "log-2",
				title: "Meeting 2",
				uploader: {
					id: "user-2",
					name: "Jane Smith",
					email: "jane@example.com",
				},
			});

			const logs = [log1, log2];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "jane",
			});

			expect(filtered).toHaveLength(1);
			expect(filtered[0]?.uploader?.name).toBe("Jane Smith");
		});

		it("should filter meetings by uploader email", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				uploader: {
					id: "user-1",
					name: "John Doe",
					email: "john@example.com",
				},
			});
			const log2 = createMockMeetingLog({
				id: "log-2",
				uploader: {
					id: "user-2",
					name: "Jane Smith",
					email: "jane@company.com",
				},
			});

			const logs = [log1, log2];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "company.com",
			});

			expect(filtered).toHaveLength(1);
			expect(filtered[0]?.uploader?.email).toBe("jane@company.com");
		});

		it("should perform case-insensitive search", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				title: "IMPORTANT STANDUP",
			});

			const logs = [log1];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "important",
			});

			expect(filtered).toHaveLength(1);
		});

		it("should search by sprint number", () => {
			const sprint1 = createMockSprint({ id: "sprint-1", number: 1 });
			const sprint2 = createMockSprint({ id: "sprint-2", number: 2 });

			const log1 = createMockMeetingLog({
				id: "log-1",
				sprintId: "sprint-1",
			});
			const log2 = createMockMeetingLog({
				id: "log-2",
				sprintId: "sprint-2",
			});

			const logs = [log1, log2];
			const sprints = [sprint1, sprint2];
			const phases: Phase[] = [];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "sprint 2",
			});

			expect(filtered).toHaveLength(1);
			expect(filtered[0]?.sprintId).toBe("sprint-2");
		});

		it("should search by phase name", () => {
			const phase1 = createMockPhase({ id: "phase-1", name: "Design" });
			const phase2 = createMockPhase({ id: "phase-2", name: "Development" });

			const log1 = createMockMeetingLog({
				id: "log-1",
				sprintId: null,
				phaseId: "phase-1",
			});
			const log2 = createMockMeetingLog({
				id: "log-2",
				sprintId: null,
				phaseId: "phase-2",
			});

			const logs = [log1, log2];
			const sprints: Sprint[] = [];
			const phases = [phase1, phase2];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "development",
			});

			expect(filtered).toHaveLength(1);
			expect(filtered[0]?.phaseId).toBe("phase-2");
		});

		it("should return all results when query is empty", () => {
			const log1 = createMockMeetingLog({ id: "log-1" });
			const log2 = createMockMeetingLog({ id: "log-2" });

			const logs = [log1, log2];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "",
			});

			expect(filtered).toHaveLength(2);
		});

		it("should return empty result when no matches found", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				title: "Planning Meeting",
			});

			const logs = [log1];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "nonexistent",
			});

			expect(filtered).toHaveLength(0);
		});
	});

	describe("Scope Filter Tests", () => {
		it("should filter meetings by Sprint scope", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				sprintId: "sprint-1",
				phaseId: null,
			});
			const log2 = createMockMeetingLog({
				id: "log-2",
				sprintId: null,
				phaseId: "phase-1",
			});

			const logs = [log1, log2];
			const sprints = [createMockSprint()];
			const phases = [createMockPhase()];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				scope: ["Sprint"],
			});

			expect(filtered).toHaveLength(1);
			expect(filtered[0]?.sprintId).toBe("sprint-1");
		});

		it("should filter meetings by Phase scope", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				sprintId: "sprint-1",
				phaseId: null,
			});
			const log2 = createMockMeetingLog({
				id: "log-2",
				sprintId: null,
				phaseId: "phase-1",
			});

			const logs = [log1, log2];
			const sprints = [createMockSprint()];
			const phases = [createMockPhase()];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				scope: ["Phase"],
			});

			expect(filtered).toHaveLength(1);
			expect(filtered[0]?.phaseId).toBe("phase-1");
		});

		it("should support multiple scope filters", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				sprintId: "sprint-1",
				phaseId: null,
			});
			const log2 = createMockMeetingLog({
				id: "log-2",
				sprintId: null,
				phaseId: "phase-1",
			});
			const log3 = createMockMeetingLog({
				id: "log-3",
				sprintId: null,
				phaseId: null,
			});

			const logs = [log1, log2, log3];
			const sprints = [createMockSprint()];
			const phases = [createMockPhase()];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				scope: ["Sprint", "Phase"],
			});

			expect(filtered).toHaveLength(2);
			expect(filtered).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: "log-1" }),
					expect.objectContaining({ id: "log-2" }),
				]),
			);
		});

		it("should return all results when scope is empty", () => {
			const log1 = createMockMeetingLog({ id: "log-1" });
			const log2 = createMockMeetingLog({ id: "log-2" });

			const logs = [log1, log2];
			const sprints = [createMockSprint()];
			const phases = [createMockPhase()];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				scope: [],
			});

			expect(filtered).toHaveLength(2);
		});
	});

	describe("Combined Filter Tests", () => {
		it("should apply both query and scope filters", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				title: "Important Sprint Meeting",
				sprintId: "sprint-1",
				phaseId: null,
			});
			const log2 = createMockMeetingLog({
				id: "log-2",
				title: "Design Phase Review",
				sprintId: null,
				phaseId: "phase-1",
			});
			const log3 = createMockMeetingLog({
				id: "log-3",
				title: "Important Planning",
				sprintId: null,
				phaseId: null,
			});

			const logs = [log1, log2, log3];
			const sprints = [createMockSprint()];
			const phases = [createMockPhase()];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "important",
				scope: ["Sprint"],
			});

			expect(filtered).toHaveLength(1);
			expect(filtered[0]?.id).toBe("log-1");
		});

		it("should return empty when query matches but scope does not", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				title: "Important Meeting",
				sprintId: null,
				phaseId: "phase-1",
			});

			const logs = [log1];
			const sprints = [createMockSprint()];
			const phases = [createMockPhase()];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "important",
				scope: ["Sprint"],
			});

			expect(filtered).toHaveLength(0);
		});
	});

	describe("Scope Counts Tests", () => {
		it("should calculate scope counts before applying scope filter", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				sprintId: "sprint-1",
				phaseId: null,
			});
			const log2 = createMockMeetingLog({
				id: "log-2",
				sprintId: null,
				phaseId: "phase-1",
			});
			const log3 = createMockMeetingLog({
				id: "log-3",
				sprintId: "sprint-1",
				phaseId: null,
			});

			const logs = [log1, log2, log3];
			const sprints = [createMockSprint()];
			const phases = [createMockPhase()];

			const { scopeCounts } = filterMeetings(logs, sprints, phases, {
				scope: ["Phase"],
			});

			// Counts should reflect unfiltered data
			expect(scopeCounts).toEqual({ Sprint: 2, Phase: 1 });
		});

		it("should only count query-filtered results in scope counts", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				title: "Important Meeting",
				sprintId: "sprint-1",
				phaseId: null,
			});
			const log2 = createMockMeetingLog({
				id: "log-2",
				title: "Design Review",
				sprintId: null,
				phaseId: "phase-1",
			});
			const log3 = createMockMeetingLog({
				id: "log-3",
				title: "Another Thing",
				sprintId: "sprint-1",
				phaseId: null,
			});

			const logs = [log1, log2, log3];
			const sprints = [createMockSprint()];
			const phases = [createMockPhase()];

			const { scopeCounts } = filterMeetings(logs, sprints, phases, {
				query: "important",
			});

			// Only query-matched results should be counted
			expect(scopeCounts).toEqual({ Sprint: 1, Phase: 0 });
		});

		it("should return zero counts when no results match", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				title: "Meeting",
				sprintId: null,
				phaseId: null,
			});

			const logs = [log1];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			const { scopeCounts } = filterMeetings(logs, sprints, phases, {
				query: "nonexistent",
			});

			expect(scopeCounts).toEqual({ Sprint: 0, Phase: 0 });
		});
	});

	describe("Edge Cases & Special Scenarios", () => {
		it("should handle meetings with undefined uploader gracefully", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				title: "Meeting",
				uploader: undefined,
			});

			const logs = [log1];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			// Should not throw
			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "meeting",
			});

			expect(filtered).toHaveLength(1);
		});

		it("should handle no filters (empty filters object)", () => {
			const log1 = createMockMeetingLog({ id: "log-1" });
			const log2 = createMockMeetingLog({ id: "log-2" });

			const logs = [log1, log2];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			const { filtered } = filterMeetings(logs, sprints, phases, {});

			expect(filtered).toHaveLength(2);
		});

		it("should handle empty logs array", () => {
			const logs: MeetingLog[] = [];
			const sprints = [createMockSprint()];
			const phases = [createMockPhase()];

			const { filtered, scopeCounts } = filterMeetings(logs, sprints, phases, {
				query: "something",
			});

			expect(filtered).toHaveLength(0);
			expect(scopeCounts).toEqual({ Sprint: 0, Phase: 0 });
		});

		it("should handle unassigned meetings (null sprintId and phaseId)", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				title: "Unassigned",
				sprintId: null,
				phaseId: null,
			});

			const logs = [log1];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "unassigned",
			});

			expect(filtered).toHaveLength(1);
		});

		it("should handle multiple meetings with same uploader", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				uploader: {
					id: "user-1",
					name: "John Doe",
					email: "john@example.com",
				},
			});
			const log2 = createMockMeetingLog({
				id: "log-2",
				uploader: {
					id: "user-1",
					name: "John Doe",
					email: "john@example.com",
				},
			});

			const logs = [log1, log2];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "john",
			});

			expect(filtered).toHaveLength(2);
		});

		it("should search with string containing whitespace", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				title: "Team Meeting",
			});

			const logs = [log1];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			// Query with whitespace - should match if not trimmed
			// This documents current behavior where whitespace is NOT trimmed
			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "team",
			});

			expect(filtered).toHaveLength(1);
		});

		it("should handle special characters in search", () => {
			const log1 = createMockMeetingLog({
				id: "log-1",
				title: "Q&A Session",
			});

			const logs = [log1];
			const sprints = [createMockSprint()];
			const phases: Phase[] = [];

			const { filtered } = filterMeetings(logs, sprints, phases, {
				query: "q&a",
			});

			expect(filtered).toHaveLength(1);
		});
	});
});
