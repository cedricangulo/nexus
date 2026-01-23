import { describe, expect, it } from "vitest";
import {
	getSprintStatus,
	mapSprintStatusToTaskStatus,
} from "@/lib/helpers/sprint";
import type { Sprint } from "@/lib/types";

/**
 * Mock Sprint data for testing
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
	...overrides,
});

describe("Sprint Filtering", () => {
	describe("Date Range Filtering", () => {
		it("should filter sprints by date range (overlap-based)", () => {
			// Sprint: Jan 1-15
			const sprint1 = createMockSprint({
				id: "sprint-1",
				startDate: "2024-01-01",
				endDate: "2024-01-15",
			});

			// Sprint: Jan 20-Feb 5
			const sprint2 = createMockSprint({
				id: "sprint-2",
				startDate: "2024-01-20",
				endDate: "2024-02-05",
			});

			// Sprint: Feb 10-25
			const sprint3 = createMockSprint({
				id: "sprint-3",
				startDate: "2024-02-10",
				endDate: "2024-02-25",
			});

			const sprints = [sprint1, sprint2, sprint3];

			// Filter sprints that overlap with Jan 10-31
			// Should return sprint1 (ends after Jan 10) and sprint2 (starts before Jan 31)
			const startDate = "2024-01-10";
			const endDate = "2024-01-31";

			const filtered = sprints.filter(
				(sprint) =>
					new Date(sprint.endDate) >= new Date(startDate) &&
					new Date(sprint.startDate) <= new Date(endDate),
			);

			expect(filtered).toHaveLength(2);
			expect(filtered).toEqual([sprint1, sprint2]);
		});

		it("should filter by start date only (sprints ending after filter start)", () => {
			const sprint1 = createMockSprint({
				id: "sprint-1",
				startDate: "2024-01-01",
				endDate: "2024-01-15",
			});

			const sprint2 = createMockSprint({
				id: "sprint-2",
				startDate: "2024-02-01",
				endDate: "2024-02-15",
			});

			const sprints = [sprint1, sprint2];
			const filterStart = "2024-01-20";

			// Should return sprints that end after Jan 20
			const filtered = sprints.filter(
				(sprint) => new Date(sprint.endDate) >= new Date(filterStart),
			);

			expect(filtered).toEqual([sprint2]);
		});

		it("should filter by end date only (sprints starting before filter end)", () => {
			const sprint1 = createMockSprint({
				id: "sprint-1",
				startDate: "2024-01-01",
				endDate: "2024-01-15",
			});

			const sprint2 = createMockSprint({
				id: "sprint-2",
				startDate: "2024-02-01",
				endDate: "2024-02-15",
			});

			const sprints = [sprint1, sprint2];
			const filterEnd = "2024-01-20";

			// Should return sprints that start before Jan 20
			const filtered = sprints.filter(
				(sprint) => new Date(sprint.startDate) <= new Date(filterEnd),
			);

			expect(filtered).toEqual([sprint1]);
		});

		it("should handle sprints that partially overlap", () => {
			// Sprint overlaps: starts before filter, ends during filter
			const sprint1 = createMockSprint({
				id: "sprint-1",
				startDate: "2024-01-01",
				endDate: "2024-01-15",
			});

			// Sprint overlaps: starts during filter, ends after filter
			const sprint2 = createMockSprint({
				id: "sprint-2",
				startDate: "2024-01-20",
				endDate: "2024-02-05",
			});

			const sprints = [sprint1, sprint2];
			const startDate = "2024-01-10";
			const endDate = "2024-01-25";

			const filtered = sprints.filter(
				(sprint) =>
					new Date(sprint.endDate) >= new Date(startDate) &&
					new Date(sprint.startDate) <= new Date(endDate),
			);

			// Both should be included since they overlap with Jan 10-25
			expect(filtered).toHaveLength(2);
		});
	});

	describe("Status Filtering", () => {
		it("should identify ACTIVE sprints correctly", () => {
			const now = new Date("2024-01-10T12:00:00");

			const activeSprint = createMockSprint({
				id: "active",
				startDate: "2024-01-01",
				endDate: "2024-01-20",
			});

			expect(getSprintStatus(activeSprint, now)).toBe("ACTIVE");
		});

		it("should identify UPCOMING sprints correctly", () => {
			const now = new Date("2024-01-01T00:00:00");

			const upcomingSprint = createMockSprint({
				id: "upcoming",
				startDate: "2024-01-05",
				endDate: "2024-01-20",
			});

			expect(getSprintStatus(upcomingSprint, now)).toBe("UPCOMING");
		});

		it("should identify OVERDUE sprints correctly", () => {
			const now = new Date("2024-02-01T00:00:00");

			const overdueSprint = createMockSprint({
				id: "overdue",
				startDate: "2024-01-01",
				endDate: "2024-01-20",
			});

			expect(getSprintStatus(overdueSprint, now)).toBe("OVERDUE");
		});

		it("should use current date by default", () => {
			const sprint = createMockSprint({
				startDate: "2024-01-01",
				endDate: "2024-01-15",
			});

			// Default now should be compared with current date
			const status = getSprintStatus(sprint);
			// Since test runs after Jan 15, 2024, it should be OVERDUE
			expect(status).toBe("OVERDUE");
		});
	});

	describe("Status to Task Status Mapping", () => {
		it("should map ACTIVE to IN_PROGRESS", () => {
			expect(mapSprintStatusToTaskStatus("ACTIVE")).toBe("IN_PROGRESS");
		});

		it("should map UPCOMING to TODO", () => {
			expect(mapSprintStatusToTaskStatus("UPCOMING")).toBe("TODO");
		});

		it("should map COMPLETED to DONE", () => {
			expect(mapSprintStatusToTaskStatus("COMPLETED")).toBe("DONE");
		});

		it("should map OVERDUE to REVIEW", () => {
			expect(mapSprintStatusToTaskStatus("OVERDUE")).toBe("REVIEW");
		});
	});

	describe("Query Filtering", () => {
		it("should filter by sprint number", () => {
			const sprint1 = createMockSprint({
				id: "sprint-1",
				number: 1,
			});

			const sprint2 = createMockSprint({
				id: "sprint-2",
				number: 25,
			});

			const sprints = [sprint1, sprint2];
			const query = "25";

			const filtered = sprints.filter((sprint) => {
				const numberMatch = sprint.number.toString().includes(query);
				return numberMatch;
			});

			expect(filtered).toEqual([sprint2]);
		});

		it("should filter by sprint goal", () => {
			const sprint1 = createMockSprint({
				id: "sprint-1",
				goal: "Implement authentication",
			});

			const sprint2 = createMockSprint({
				id: "sprint-2",
				goal: "Database optimization",
			});

			const sprints = [sprint1, sprint2];
			const query = "auth";

			const filtered = sprints.filter((sprint) => {
				const q = query.toLowerCase();
				const goalMatch = sprint.goal?.toLowerCase().includes(q) ?? false;
				return goalMatch;
			});

			expect(filtered).toEqual([sprint1]);
		});

		it("should be case-insensitive for goal search", () => {
			const sprint = createMockSprint({
				id: "sprint-1",
				goal: "Implement Authentication",
			});

			const sprints = [sprint];
			const query = "AUTHENTICATION";

			const filtered = sprints.filter((sprint) => {
				const q = query.toLowerCase();
				const goalMatch = sprint.goal?.toLowerCase().includes(q) ?? false;
				return goalMatch;
			});

			expect(filtered).toEqual([sprint]);
		});

		it("should return empty array if no matches", () => {
			const sprint = createMockSprint({
				id: "sprint-1",
				goal: "Authentication",
			});

			const sprints = [sprint];
			const query = "database";

			const filtered = sprints.filter((sprint) => {
				const q = query.toLowerCase();
				const numberMatch = sprint.number.toString().includes(q);
				const goalMatch = sprint.goal?.toLowerCase().includes(q) ?? false;
				return numberMatch || goalMatch;
			});

			expect(filtered).toHaveLength(0);
		});
	});

	describe("Combined Filters", () => {
		it("should apply status and query filters together", () => {
			const now = new Date("2024-01-10");

			const activeSprint1 = createMockSprint({
				id: "active-1",
				number: 1,
				goal: "Authentication",
				startDate: "2024-01-01",
				endDate: "2024-01-20",
			});

			const activeSprint2 = createMockSprint({
				id: "active-2",
				number: 2,
				goal: "Database",
				startDate: "2024-01-05",
				endDate: "2024-01-25",
			});

			const upcomingSprint = createMockSprint({
				id: "upcoming",
				number: 3,
				goal: "Authentication",
				startDate: "2024-02-01",
				endDate: "2024-02-15",
			});

			const sprints = [activeSprint1, activeSprint2, upcomingSprint];

			// Filter: ACTIVE status AND "Authentication" in goal
			const filtered = sprints.filter((sprint) => {
				const status = getSprintStatus(sprint, now);
				if (status !== "ACTIVE") return false;

				const query = "Authentication".toLowerCase();
				return sprint.goal?.toLowerCase().includes(query) ?? false;
			});

			expect(filtered).toEqual([activeSprint1]);
		});

		it("should apply date range and query filters together", () => {
			const sprint1 = createMockSprint({
				id: "sprint-1",
				goal: "Auth",
				startDate: "2024-01-01",
				endDate: "2024-01-15",
			});

			const sprint2 = createMockSprint({
				id: "sprint-2",
				goal: "Database",
				startDate: "2024-01-20",
				endDate: "2024-02-05",
			});

			const sprints = [sprint1, sprint2];
			const startDate = "2024-01-10";
			const endDate = "2024-01-31";
			const query = "Auth";

			const filtered = sprints.filter((sprint) => {
				// Date range filter
				const inDateRange =
					new Date(sprint.endDate) >= new Date(startDate) &&
					new Date(sprint.startDate) <= new Date(endDate);

				if (!inDateRange) return false;

				// Query filter
				const q = query.toLowerCase();
				const matchesGoal = sprint.goal?.toLowerCase().includes(q) ?? false;

				return matchesGoal;
			});

			expect(filtered).toEqual([sprint1]);
		});
	});
});
