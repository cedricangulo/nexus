/**
 * Dashboard Computation Helpers
 * Centralized functions for calculating dashboard metrics and aggregates
 */

import type {
  Deliverable,
  DeliverableStatus,
  Phase,
  PhaseType,
  Sprint,
  Task,
  TaskStatus,
  User,
  UserContribution,
} from "@/lib/types";

// === Phase Progress Computations ===

export type PhaseProgress = {
  id: string;
  type: PhaseType;
  name: string;
  description: string | null;
  completionPercentage: number;
  totalDeliverables: number;
  completedDeliverables: number;
  inProgressDeliverables: number;
  reviewDeliverables: number;
  notStartedDeliverables: number;
  status: "Completed" | "Active" | "Pending" | "At Risk";
  startDate: string | null;
  endDate: string | null;
};

export function computePhaseProgress(
  phase: Phase,
  deliverables: Deliverable[]
): PhaseProgress {
  const phaseDeliverables = deliverables.filter(
    (d) => d.phaseId === phase.id && !d.deletedAt
  );

  const statusCounts = phaseDeliverables.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    {} as Record<DeliverableStatus, number>
  );

  const completedCount = statusCounts.COMPLETED || 0;
  const inProgressCount = statusCounts.IN_PROGRESS || 0;
  const reviewCount = statusCounts.REVIEW || 0;
  const notStartedCount = statusCounts.NOT_STARTED || 0;
  const total = phaseDeliverables.length;

  const completionPercentage = total > 0 ? (completedCount / total) * 100 : 0;

  // Determine phase status based on date range and completion
  let status: PhaseProgress["status"] = "Pending";
  const today = new Date();
  const phaseStart = phase.startDate ? new Date(phase.startDate) : null;
  const phaseEnd = phase.endDate ? new Date(phase.endDate) : null;
  const isWithinDateRange =
    (!phaseStart || today >= phaseStart) && (!phaseEnd || today <= phaseEnd);

  if (completionPercentage === 100) {
    status = "Completed";
  } else if (isWithinDateRange && (reviewCount > 0 || inProgressCount > 0)) {
    // Phase is currently active (within date range and has work in progress)
    status = "Active";
  } else if (phaseEnd && phaseEnd < today && completionPercentage < 100) {
    // Phase deadline passed but not complete
    status = "At Risk";
  } else if (phaseStart && today < phaseStart) {
    // Phase hasn't started yet
    status = "Pending";
  } else if (!isWithinDateRange && (reviewCount > 0 || inProgressCount > 0)) {
    // Items are in progress but phase is outside its date range
    status = "At Risk";
  }

  return {
    id: phase.id,
    type: phase.type,
    name: phase.name,
    description: phase.description || null,
    completionPercentage: Math.round(completionPercentage),
    totalDeliverables: total,
    completedDeliverables: completedCount,
    inProgressDeliverables: inProgressCount,
    reviewDeliverables: reviewCount,
    notStartedDeliverables: notStartedCount,
    status,
    startDate: phase.startDate || null,
    endDate: phase.endDate || null,
  };
}

// === Overall Project Completion ===

export type ProjectCompletion = {
  overallPercentage: number;
  totalDeliverables: number;
  completedDeliverables: number;
  inProgressDeliverables: number;
  reviewDeliverables: number;
  completedPhaseCount: number;
  activePhaseCompletion: number;
  isOnTrack: boolean;
  statusReason: string;
  activePhaseEndDate?: string | null;
};

export function computeProjectCompletion(
  deliverables: Deliverable[],
  phases: Phase[]
): ProjectCompletion {
  const activeDeliverables = deliverables.filter((d) => !d.deletedAt);
  const now = new Date();

  const statusCounts = activeDeliverables.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    {} as Record<DeliverableStatus, number>
  );

  const completed = statusCounts.COMPLETED || 0;
  const inProgress = statusCounts.IN_PROGRESS || 0;
  const review = statusCounts.REVIEW || 0;
  const total = activeDeliverables.length;

  const overallPercentage = total > 0 ? (completed / total) * 100 : 0;

  // Count deliverables from completed phases
  const completedPhases = phases.filter((p) => {
    if (!p.endDate) {
      return false;
    }
    const phaseEnd = new Date(p.endDate);
    const phaseDeliverables = activeDeliverables.filter(
      (d) => d.phaseId === p.id && d.status === "COMPLETED"
    );
    const totalPhaseDeliverables = activeDeliverables.filter(
      (d) => d.phaseId === p.id
    );
    return (
      phaseEnd < now &&
      totalPhaseDeliverables.length > 0 &&
      phaseDeliverables.length === totalPhaseDeliverables.length
    );
  });

  // Calculate active phase completion
  const activePhases = phases.filter((p) => {
    if (!(p.startDate && p.endDate)) {
      return false;
    }
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    return now >= start && now <= end;
  });

  let activePhaseCompletion = 0;
  if (activePhases.length > 0) {
    const activePhaseDeliverables = activeDeliverables.filter((d) =>
      activePhases.some((p) => p.id === d.phaseId)
    );
    const activeCompleted = activePhaseDeliverables.filter(
      (d) => d.status === "COMPLETED"
    ).length;
    if (activePhaseDeliverables.length > 0) {
      activePhaseCompletion = Math.round(
        (activeCompleted / activePhaseDeliverables.length) * 100
      );
    }
  }

  // Determine on-track status
  let isOnTrack = false;
  let statusReason = "";

  if (completedPhases.length > 0) {
    // If any phase is completed, we're on track
    isOnTrack = true;
    statusReason = `${completedPhases.length} phase(s) completed`;
  } else if (activePhases.length > 0 && activePhaseCompletion >= 50) {
    // Active phase with 50%+ progress is on track
    isOnTrack = true;
    statusReason = `Active phase ${activePhaseCompletion}% complete`;
  } else if (overallPercentage >= 33) {
    // Low progress, but some momentum
    isOnTrack = false;
    statusReason = "Needs acceleration";
  } else {
    isOnTrack = false;
    statusReason = "Significant delay";
  }

  return {
    overallPercentage: Math.round(overallPercentage),
    totalDeliverables: total,
    completedDeliverables: completed,
    inProgressDeliverables: inProgress,
    reviewDeliverables: review,
    completedPhaseCount: completedPhases.length,
    activePhaseCompletion,
    isOnTrack,
    statusReason,
    activePhaseEndDate:
      activePhases.length > 0 ? activePhases[0].endDate || null : null,
  };
}

// === Sprint Health Metrics ===

export type SprintHealth = {
  id: string;
  number: number;
  goal: string | null;
  startDate: string;
  endDate: string;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  doneTasks: number;
  completionPercentage: number;
  daysRemaining: number;
  isActive: boolean;
};

export function computeSprintHealth(
  sprint: Sprint,
  tasks: Task[]
): SprintHealth {
  const sprintTasks = tasks.filter(
    (t) => t.sprintId === sprint.id && !t.deletedAt
  );

  const statusCounts = sprintTasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {} as Record<TaskStatus, number>
  );

  const done = statusCounts.DONE || 0;
  const inProgress = statusCounts.IN_PROGRESS || 0;
  const blocked = statusCounts.BLOCKED || 0;
  const todo = statusCounts.TODO || 0;
  const total = sprintTasks.length;

  const completionPercentage = total > 0 ? (done / total) * 100 : 0;

  const today = new Date();
  const endDate = new Date(sprint.endDate);
  const daysRemaining = Math.ceil(
    (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const startDate = new Date(sprint.startDate);
  const isActive = today >= startDate && today <= endDate;

  return {
    id: sprint.id,
    number: sprint.number,
    goal: sprint.goal || "",
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    totalTasks: total,
    todoTasks: todo,
    inProgressTasks: inProgress,
    blockedTasks: blocked,
    doneTasks: done,
    completionPercentage: Math.round(completionPercentage),
    daysRemaining,
    isActive,
  };
}

// === Blocked Items (Tasks Only) ===

export type BlockedItem = {
  id: string;
  type: "task";
  title: string;
  assignee?: { id: string; name: string } | null;
  reason: string | null;
  updatedAt: string;
};

/**
 * Get tasks that are blocked (work is impeded, requires intervention)
 * Blocked tasks have a mandatory explanation comment
 */
export function getBlockedTasks(tasks: Task[], users: User[]): BlockedItem[] {
  const blockedTasks = tasks.filter(
    (t) => t.status === "BLOCKED" && !t.deletedAt
  );

  return blockedTasks.map((task) => {
    // Use first assignee from the assignees array if available
    const firstAssignee = task.assignees?.[0];
    const assignee = firstAssignee
      ? users.find((u) => u.id === firstAssignee.id)
      : null;

    return {
      id: task.id,
      type: "task" as const,
      title: task.title,
      assignee: assignee ? { id: assignee.id, name: assignee.name } : null,
      reason: task.lastComment?.content || null,
      updatedAt: task.updatedAt,
    };
  });
}

// === Pending Approvals (Deliverables) ===

export type PendingApproval = {
  id: string;
  type: "deliverable";
  title: string;
  reason: string;
  updatedAt: string;
};

/**
 * Get deliverables awaiting team lead approval (in REVIEW status)
 * These are part of normal workflow, not critical blockers
 */
export function getPendingApprovals(
  deliverables: Deliverable[]
): PendingApproval[] {
  const reviewDeliverables = deliverables.filter(
    (d) => d.status === "REVIEW" && !d.deletedAt
  );

  return reviewDeliverables.map((d) => ({
    id: d.id,
    type: "deliverable" as const,
    title: d.title,
    reason: "Awaiting approval",
    updatedAt: d.updatedAt,
  }));
}

// === Team Contributions ===

export type TeamMemberSummary = {
  id: string;
  name: string;
  email: string;
  role: string;
  tasksAssigned: number;
  tasksCompleted: number;
  evidenceUploaded: number;
  commentsCount: number;
  lastActivity: string | null;
};

export function computeTeamMemberSummary(
  user: User,
  contribution: UserContribution,
  tasks: Task[],
  lastActivityDate?: string
): TeamMemberSummary {
  const userTasks = tasks.filter(
    (t) => t.assignees?.some((a) => a.id === user.id) && !t.deletedAt
  );
  const tasksAssigned = userTasks.length;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tasksAssigned,
    tasksCompleted: contribution.completedTasksCount,
    evidenceUploaded: contribution.uploadedEvidenceCount,
    commentsCount: contribution.commentsCount,
    lastActivity: lastActivityDate || null,
  };
}

// === Current Sprint Detection ===

export function findCurrentSprint(sprints: Sprint[]): Sprint | null {
  const today = new Date();
  const activeSprint = sprints.find((s) => {
    const start = new Date(s.startDate);
    const end = new Date(s.endDate);
    return today >= start && today <= end && !s.deletedAt;
  });

  if (activeSprint) {
    return activeSprint;
  }

  // If no active sprint, return the most recent one
  const sortedSprints = sprints
    .filter((s) => !s.deletedAt)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

  return sortedSprints[0] || null;
}

// === Phase Icons & Colors ===

export const PHASE_CONFIG = {
  WATERFALL: {
    icon: "Droplet",
    bgColor: "bg-chart-2/10",
    textColor: "text-chart-2",
    description: "Planning and Requirements",
  },
  SCRUM: {
    icon: "RefreshCw",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    description: "Iterative Development",
  },
  FALL: {
    icon: "Rocket",
    bgColor: "bg-chart-5/10",
    textColor: "text-chart-5",
    description: "Testing and Deployment",
  },
} as const;
