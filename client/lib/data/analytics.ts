import { cache } from "react";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getApiClient } from "@/lib/api/server-client";
import { getAuthContext } from "@/lib/helpers/auth-token";
import type { Deliverable, Sprint, Task } from "../types";

export type DashboardOverview = {
	projectProgress: number;
	totalTasks: number;
	completedTasks: number;
	totalSprints: number;
	activeSprint: {
		id: string;
		name: string;
		number: number;
		endDate: string;
	} | null;
	daysRemaining: number | null;
};

export type PhaseAnalytics = {
	id: string;
	name: string;
	type: string;
	status: string;
	progress: number;
	startDate: string | null;
	endDate: string | null;
	totalDeliverables: number;
	completedDeliverables: number;
};

export type SprintAnalytics = {
	id: string;
	name: string;
	number: number;
	status: string;
	progress: number;
	startDate: string;
	endDate: string;
	totalTasks: number;
	completedTasks: number;
};

export type TeamContribution = {
	userId: string;
	name: string;
	email: string;
	role: string;
	tasksAssigned: number;
	tasksCompleted: number;
	completionRate: number;
};

export type TimelineItem = {
	id: string;
	type: "Phase" | "Sprint";
	name: string;
	startDate: string | null;
	endDate: string | null;
	status: string;
	progress: number;
};

export type TaskStatusBreakdown = {
	completedTasks: number;
	inProgressTasks: number;
	blockedTasks: number;
	todoTasks: number;
	totalTasks: number;
};

export type ActiveSprintProgress = {
	id: string;
	name: string;
	number: number;
	progress: number;
	daysRemaining: number;
	startDate: string;
	endDate: string;
} | null;

export type SprintMetrics = {
	daysRemaining: number | null;
	currentSprintGoal: string | null;
	completedSprintsCount: number;
	avgVelocity: number;
	blockedTasksCount: number;
};

export type VelocityDataPoint = {
	sprintNumber: number;
	sprintName: string;
	tasksCompleted: number;
};

export type BurndownDataPoint = {
	day: number;
	date: string;
	remaining: number;
	ideal: number;
};

export const getDashboardOverview = cache(
	async (explicitToken?: string): Promise<DashboardOverview | null> => {
		try {
			const api = await getApiClient(explicitToken);

			const response = await api.get<DashboardOverview>(
				API_ENDPOINTS.ANALYTICS.OVERVIEW,
			);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch dashboard overview:", error);
			return null;
		}
	},
);

export const getPhaseAnalytics = cache(
	async (explicitToken?: string): Promise<PhaseAnalytics[]> => {
		try {
			const api = await getApiClient(explicitToken);
			const response = await api.get<PhaseAnalytics[]>(
				API_ENDPOINTS.ANALYTICS.PHASES,
			);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch phase analytics:", error);
			return [];
		}
	},
);

export const getSprintAnalytics = cache(
	async (explicitToken?: string): Promise<SprintAnalytics[]> => {
		try {
			const api = await getApiClient(explicitToken);
			const response = await api.get<SprintAnalytics[]>(
				API_ENDPOINTS.ANALYTICS.SPRINTS,
			);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch sprint analytics:", error);
			return [];
		}
	},
);

export const getTeamContributions = cache(
	async (explicitToken?: string): Promise<TeamContribution[]> => {
		try {
			const api = await getApiClient(explicitToken);
			const response = await api.get<TeamContribution[]>(
				API_ENDPOINTS.ANALYTICS.CONTRIBUTIONS,
			);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch team contributions:", error);
			return [];
		}
	},
);

export const getTimelineData = cache(
	async (explicitToken?: string): Promise<TimelineItem[]> => {
		try {
			const api = await getApiClient(explicitToken);
			const response = await api.get<TimelineItem[]>(
				API_ENDPOINTS.ANALYTICS.TIMELINE,
			);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch timeline data:", error);
			return [];
		}
	},
);

export const getTaskStatusBreakdown = cache(
	async (explicitToken?: string): Promise<TaskStatusBreakdown> => {
		try {
			const api = await getApiClient(explicitToken);
			const response = await api.get<Task[]>(API_ENDPOINTS.TASKS.LIST);
			const tasks = response.data.filter((task) => !task.deletedAt);

			const completedTasks = tasks.filter((t) => t.status === "DONE").length;
			const inProgressTasks = tasks.filter(
				(t) => t.status === "IN_PROGRESS",
			).length;
			const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
			const todoTasks = tasks.filter((t) => t.status === "TODO").length;

			return {
				completedTasks,
				inProgressTasks,
				blockedTasks,
				todoTasks,
				totalTasks: tasks.length,
			};
		} catch (error) {
			console.error("Failed to fetch task status breakdown:", error);
			return {
				completedTasks: 0,
				inProgressTasks: 0,
				blockedTasks: 0,
				todoTasks: 0,
				totalTasks: 0,
			};
		}
	},
);

export const getActiveSprintBreakdown = cache(
	async (explicitToken?: string): Promise<TaskStatusBreakdown> => {
		try {
			const api = await getApiClient(explicitToken);
			const response = await api.get<Sprint[]>(API_ENDPOINTS.SPRINTS.LIST);
			const sprints = response.data.filter((sprint) => !sprint.deletedAt);

			const now = new Date();
			const activeSprint = sprints.find((sprint) => {
				const start = new Date(sprint.startDate);
				const end = new Date(sprint.endDate);
				return now >= start && now <= end;
			});

			if (!activeSprint) {
				return {
					completedTasks: 0,
					inProgressTasks: 0,
					blockedTasks: 0,
					todoTasks: 0,
					totalTasks: 0,
				};
			}

			const tasksResponse = await api.get<Task[]>(API_ENDPOINTS.TASKS.LIST);
			const sprintTasks = tasksResponse.data.filter(
				(task) => task.sprintId === activeSprint.id && !task.deletedAt,
			);

			const completedTasks = sprintTasks.filter(
				(t) => t.status === "DONE",
			).length;
			const inProgressTasks = sprintTasks.filter(
				(t) => t.status === "IN_PROGRESS",
			).length;
			const blockedTasks = sprintTasks.filter(
				(t) => t.status === "BLOCKED",
			).length;
			const todoTasks = sprintTasks.filter((t) => t.status === "TODO").length;

			return {
				completedTasks,
				inProgressTasks,
				blockedTasks,
				todoTasks,
				totalTasks: sprintTasks.length,
			};
		} catch (error) {
			console.error("Failed to fetch active sprint breakdown:", error);
			return {
				completedTasks: 0,
				inProgressTasks: 0,
				blockedTasks: 0,
				todoTasks: 0,
				totalTasks: 0,
			};
		}
	},
);

export const getActiveSprintProgress = cache(
	async (explicitToken?: string): Promise<ActiveSprintProgress> => {
		try {
			const api = await getApiClient(explicitToken);
			const response = await api.get<Sprint[]>(API_ENDPOINTS.SPRINTS.LIST);
			const sprints = response.data.filter((sprint) => !sprint.deletedAt);

			const now = new Date();
			const activeSprint = sprints.find((sprint) => {
				const start = new Date(sprint.startDate);
				const end = new Date(sprint.endDate);
				return now >= start && now <= end;
			});

			if (!activeSprint) {
				return null;
			}

			const tasksResponse = await api.get<Task[]>(API_ENDPOINTS.TASKS.LIST);
			const sprintTasks = tasksResponse.data.filter(
				(task) => task.sprintId === activeSprint.id && !task.deletedAt,
			);

			const completedTasks = sprintTasks.filter(
				(t) => t.status === "DONE",
			).length;
			const totalTasks = sprintTasks.length;
			const progress =
				totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

			const endDate = new Date(activeSprint.endDate);
			const daysRemaining = Math.ceil(
				(endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
			);

			return {
				id: activeSprint.id,
				name: `Sprint ${activeSprint.number}`,
				number: activeSprint.number,
				progress,
				daysRemaining: Math.max(0, daysRemaining),
				startDate: activeSprint.startDate,
				endDate: activeSprint.endDate,
			};
		} catch (error) {
			console.error("Failed to fetch active sprint progress:", error);
			return null;
		}
	},
);

export const getBlockedTasksCount = cache(
	async (explicitToken?: string): Promise<number> => {
		try {
			const api = await getApiClient(explicitToken);
			const response = await api.get<Task[]>(API_ENDPOINTS.TASKS.LIST);
			const tasks = response.data.filter((task) => !task.deletedAt);
			return tasks.filter((t) => t.status === "BLOCKED").length;
		} catch (error) {
			console.error("Failed to fetch blocked tasks count:", error);
			return 0;
		}
	},
);

export const getPendingApprovalsCount = cache(
	async (explicitToken?: string): Promise<number> => {
		try {
			const api = await getApiClient(explicitToken);
			const response = await api.get<Deliverable[]>(
				API_ENDPOINTS.DELIVERABLES.LIST,
			);
			const deliverables = response.data.filter((d) => !d.deletedAt);
			return deliverables.filter((d) => d.status === "REVIEW").length;
		} catch (error) {
			console.error("Failed to fetch pending approvals count:", error);
			return 0;
		}
	},
);

export const getMyTasks = cache(
	async (explicitToken?: string): Promise<Task[]> => {
		try {
			const { user } = await getAuthContext();
			const api = await getApiClient(explicitToken);
			const response = await api.get<Task[]>(API_ENDPOINTS.TASKS.LIST);
			const tasks = response.data.filter((task) => !task.deletedAt);

			return tasks.filter((task) =>
				task.assignees?.some((assignee) => assignee.id === user.id),
			);
		} catch (error) {
			console.error("Failed to fetch my tasks:", error);
			return [];
		}
	},
);

export const getSprintMetrics = cache(
	async (explicitToken?: string): Promise<SprintMetrics> => {
		try {
			const api = await getApiClient(explicitToken);

			const [sprintsResponse, tasksResponse] = await Promise.all([
				api.get<Sprint[]>(API_ENDPOINTS.SPRINTS.LIST),
				api.get<Task[]>(API_ENDPOINTS.TASKS.LIST),
			]);

			const sprints = sprintsResponse.data.filter((s) => !s.deletedAt);
			const tasks = tasksResponse.data.filter((t) => !t.deletedAt);
			const now = new Date();

			const activeSprint = sprints.find((sprint) => {
				const start = new Date(sprint.startDate);
				const end = new Date(sprint.endDate);
				return now >= start && now <= end;
			});

			const daysRemaining = activeSprint
				? Math.ceil(
						(new Date(activeSprint.endDate).getTime() - now.getTime()) /
							(1000 * 60 * 60 * 24),
					)
				: null;

			const completedSprints = sprints.filter((sprint) => {
				const end = new Date(sprint.endDate);
				if (end >= now) return false;

				const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
				return (
					sprintTasks.length > 0 &&
					sprintTasks.every((t) => t.status === "DONE")
				);
			});

			const velocities = completedSprints.map((sprint) => {
				const sprintTasks = tasks.filter(
					(t) => t.sprintId === sprint.id && t.status === "DONE",
				);
				return sprintTasks.length;
			});
			const avgVelocity =
				velocities.length > 0
					? Math.round(
							velocities.reduce((sum, v) => sum + v, 0) / velocities.length,
						)
					: 0;

			const blockedTasksCount = tasks.filter(
				(t) => t.status === "BLOCKED",
			).length;

			return {
				daysRemaining:
					daysRemaining !== null ? Math.max(0, daysRemaining) : null,
				currentSprintGoal: activeSprint?.goal || null,
				completedSprintsCount: completedSprints.length,
				avgVelocity,
				blockedTasksCount,
			};
		} catch (error) {
			console.error("Failed to fetch sprint metrics:", error);
			return {
				daysRemaining: null,
				currentSprintGoal: null,
				completedSprintsCount: 0,
				avgVelocity: 0,
				blockedTasksCount: 0,
			};
		}
	},
);

export const getSprintVelocityTrend = cache(
	async (explicitToken?: string): Promise<VelocityDataPoint[]> => {
		try {
			const api = await getApiClient(explicitToken);

			const [sprintsResponse, tasksResponse] = await Promise.all([
				api.get<Sprint[]>(API_ENDPOINTS.SPRINTS.LIST),
				api.get<Task[]>(API_ENDPOINTS.TASKS.LIST),
			]);

			const sprints = sprintsResponse.data
				.filter((s) => !s.deletedAt)
				.sort((a, b) => a.number - b.number);

			const tasks = tasksResponse.data.filter((t) => !t.deletedAt);
			const now = new Date();

			const startedSprints = sprints.filter((sprint) => {
				const start = new Date(sprint.startDate);
				return start <= now;
			});

			return startedSprints.map((sprint) => {
				const completedTasks = tasks.filter(
					(t) => t.sprintId === sprint.id && t.status === "DONE",
				).length;

				return {
					sprintNumber: sprint.number,
					sprintName: `Sprint ${sprint.number}`,
					tasksCompleted: completedTasks,
				};
			});
		} catch (error) {
			console.error("Failed to fetch sprint velocity trend:", error);
			return [];
		}
	},
);

export const getCurrentSprintBurndown = cache(
	async (explicitToken?: string): Promise<BurndownDataPoint[]> => {
		try {
			const api = await getApiClient(explicitToken);

			const [sprintsResponse, tasksResponse] = await Promise.all([
				api.get<Sprint[]>(API_ENDPOINTS.SPRINTS.LIST),
				api.get<Task[]>(API_ENDPOINTS.TASKS.LIST),
			]);

			const sprints = sprintsResponse.data.filter((s) => !s.deletedAt);
			const tasks = tasksResponse.data.filter((t) => !t.deletedAt);
			const now = new Date();

			const activeSprint = sprints.find((sprint) => {
				const start = new Date(sprint.startDate);
				const end = new Date(sprint.endDate);
				return now >= start && now <= end;
			});

			if (!activeSprint) {
				return [];
			}

			const sprintTasks = tasks.filter((t) => t.sprintId === activeSprint.id);
			const totalTasks = sprintTasks.length;

			const startDate = new Date(activeSprint.startDate);
			const endDate = new Date(activeSprint.endDate);
			const totalDays = Math.ceil(
				(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
			);
			const currentDay = Math.min(
				Math.ceil(
					(now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
				),
				totalDays,
			);

			const data: BurndownDataPoint[] = [];
			const _cumulativeCompleted = 0;

			for (let day = 0; day <= totalDays; day++) {
				const dayDate = new Date(startDate);
				dayDate.setDate(dayDate.getDate() + day);

				// Calculate ideal burndown
				const idealRemaining = Math.max(
					0,
					totalTasks - (totalTasks / totalDays) * day,
				);

				// Calculate actual remaining for this specific day
				let actualRemaining: number;

				if (day > currentDay) {
					// Future days - no data yet
					actualRemaining = NaN;
				} else if (day === 0) {
					// Sprint start - all tasks remaining
					actualRemaining = totalTasks;
				} else {
					// Count tasks completed up to this day
					const dayEnd = new Date(dayDate);
					dayEnd.setHours(23, 59, 59, 999);

					const completedByThisDay = sprintTasks.filter((task) => {
						if (task.status !== "DONE") return false;
						const updatedDate = new Date(task.updatedAt);
						return updatedDate <= dayEnd;
					}).length;

					actualRemaining = totalTasks - completedByThisDay;
				}

				data.push({
					day,
					date: dayDate.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					}),
					remaining: actualRemaining,
					ideal: Math.round(idealRemaining),
				});
			}

			return data;
		} catch (error) {
			console.error("Failed to fetch sprint burndown:", error);
			return [];
		}
	},
);
