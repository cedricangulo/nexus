import { getPrismaClient } from "../../utils/database.js";
import { TaskStatus, DeliverableStatus } from "../../generated/client.js";

const prisma = getPrismaClient();

export async function getDashboardOverview() {
  const totalTasks = await prisma.task.count({
    where: { deletedAt: null },
  });

  const completedTasks = await prisma.task.count({
    where: {
      status: TaskStatus.DONE,
      deletedAt: null
    },
  });

  const totalSprints = await prisma.sprint.count({
    where: { deletedAt: null },
  });

  const now = new Date();
  const activeSprint = await prisma.sprint.findFirst({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
      deletedAt: null,
    },
    orderBy: { endDate: 'asc' },
  });

  const project = await prisma.project.findFirst();
  let daysRemaining = null;
  if (project && project.endDate) {
    const diffTime = project.endDate.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    projectProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    totalTasks,
    completedTasks,
    totalSprints,
    activeSprint: activeSprint ? {
      id: activeSprint.id,
      name: activeSprint.goal || `Sprint ${activeSprint.number}`,
      number: activeSprint.number,
      endDate: activeSprint.endDate,
    } : null,
    daysRemaining: daysRemaining && daysRemaining > 0 ? daysRemaining : 0,
  };
}

export async function getPhaseAnalytics() {
  const phases = await prisma.phase.findMany({
    include: {
      deliverables: {
        where: { deletedAt: null }
      }
    },
    orderBy: { startDate: 'asc' }
  });

  const now = new Date();

  return phases.map(phase => {
    const total = phase.deliverables.length;
    const completed = phase.deliverables.filter(d => d.status === DeliverableStatus.COMPLETED).length;

    let status = 'Upcoming';
    if (phase.startDate && phase.endDate) {
      if (now > phase.endDate) status = 'Completed';
      else if (now >= phase.startDate && now <= phase.endDate) status = 'Active';
    } else if (completed === total && total > 0) {
      status = 'Completed';
    }

    return {
      id: phase.id,
      name: phase.name,
      type: phase.type,
      status,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      startDate: phase.startDate,
      endDate: phase.endDate,
      totalDeliverables: total,
      completedDeliverables: completed,
    };
  });
}

export async function getSprintAnalytics() {
  const sprints = await prisma.sprint.findMany({
    where: { deletedAt: null },
    include: {
      tasks: {
        where: { deletedAt: null }
      }
    },
    orderBy: { number: 'asc' }
  });

  const now = new Date();

  return sprints.map(sprint => {
    const total = sprint.tasks.length;
    const completed = sprint.tasks.filter(t => t.status === TaskStatus.DONE).length;

    let status = 'Future';
    if (now > sprint.endDate) status = 'Completed';
    else if (now >= sprint.startDate && now <= sprint.endDate) status = 'Active';

    return {
      id: sprint.id,
      name: sprint.goal || `Sprint ${sprint.number}`,
      number: sprint.number,
      status,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      totalTasks: total,
      completedTasks: completed,
    };
  });
}

export async function getTeamContributions() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: {
      taskAssignments: {
        include: {
          task: {
            select: { status: true, deletedAt: true }
          }
        }
      }
    }
  });

  return users.map(user => {
    const activeTasks = user.taskAssignments.filter(a => !a.task.deletedAt);
    const assigned = activeTasks.length;
    const completed = activeTasks.filter(a => a.task.status === TaskStatus.DONE).length;

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tasksAssigned: assigned,
      tasksCompleted: completed,
      completionRate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0,
    };
  });
}

export async function getTimelineData() {
  const phases = await getPhaseAnalytics();
  const sprints = await getSprintAnalytics();

  const timelineItems = [
    ...phases.map(p => ({
      id: p.id,
      type: 'Phase' as const,
      name: p.name,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
      progress: p.progress
    })),
    ...sprints.map(s => ({
      id: s.id,
      type: 'Sprint' as const,
      name: `Sprint ${s.number}: ${s.name}`,
      startDate: s.startDate,
      endDate: s.endDate,
      status: s.status,
      progress: s.progress
    }))
  ];

  // Sort by start date
  return timelineItems.sort((a, b) => {
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return a.startDate.getTime() - b.startDate.getTime();
  });
}

/**
 * Gantt View Data
 * Returns phases, sprints, and tasks with planned vs actual dates and delay indicators
 */
export async function getGanttData() {
  const now = new Date();

  // Get phases with their date ranges
  const phases = await prisma.phase.findMany({
    include: {
      deliverables: {
        where: { deletedAt: null }
      }
    },
    orderBy: { startDate: 'asc' }
  });

  // Get sprints
  const sprints = await prisma.sprint.findMany({
    where: { deletedAt: null },
    orderBy: { number: 'asc' }
  });

  // Get tasks with assignee info
  const tasks = await prisma.task.findMany({
    where: { deletedAt: null },
    include: {
      assignments: {
        include: {
          user: { select: { name: true } }
        }
      },
      sprint: {
        select: { endDate: true }
      },
      phase: {
        select: { endDate: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  const ganttItems = [];

  // Add phases
  for (const phase of phases) {
    const total = phase.deliverables.length;
    const completed = phase.deliverables.filter(d => d.status === 'COMPLETED').length;
    const isDelayed = phase.endDate ? now > phase.endDate && completed < total : false;
    const delayDays = isDelayed && phase.endDate
      ? Math.ceil((now.getTime() - phase.endDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    ganttItems.push({
      id: phase.id,
      type: 'Phase' as const,
      name: phase.name,
      startDate: phase.startDate,
      endDate: phase.endDate,
      completedAt: completed === total && total > 0 ? now : null,
      status: completed === total && total > 0 ? 'Completed' : (phase.startDate && now >= phase.startDate ? 'Active' : 'Upcoming'),
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      assignee: null,
      parentId: null,
      isDelayed,
      delayDays,
    });
  }

  // Add sprints
  for (const sprint of sprints) {
    const sprintTasks = tasks.filter(t => t.sprintId === sprint.id);
    const total = sprintTasks.length;
    const completed = sprintTasks.filter(t => t.status === 'DONE').length;
    const isDelayed = now > sprint.endDate && completed < total;
    const delayDays = isDelayed
      ? Math.ceil((now.getTime() - sprint.endDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    ganttItems.push({
      id: sprint.id,
      type: 'Sprint' as const,
      name: sprint.goal || `Sprint ${sprint.number}`,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      completedAt: completed === total && total > 0 ? sprint.endDate : null,
      status: now > sprint.endDate ? 'Completed' : (now >= sprint.startDate ? 'Active' : 'Future'),
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      assignee: null,
      parentId: null,
      isDelayed,
      delayDays,
    });
  }

  // Add tasks
  for (const task of tasks) {
    const deadline = task.sprint?.endDate || task.phase?.endDate || null;
    const isDone = task.status === 'DONE';
    const isDelayed = !isDone && deadline ? now > deadline : false;
    const delayDays = isDelayed && deadline
      ? Math.ceil((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    ganttItems.push({
      id: task.id,
      type: 'Task' as const,
      name: task.title,
      startDate: task.createdAt,
      endDate: deadline,
      completedAt: isDone ? task.updatedAt : null,
      status: task.status,
      progress: isDone ? 100 : (task.status === 'IN_PROGRESS' ? 50 : 0),
      assignee: task.assignments[0]?.user?.name || null,
      parentId: task.sprintId || task.phaseId || null,
      isDelayed,
      delayDays,
    });
  }

  // Sort by start date, then by type (phases first, then sprints, then tasks)
  const typeOrder = { Phase: 0, Sprint: 1, Task: 2 };
  return ganttItems.sort((a, b) => {
    const startA = a.startDate?.getTime() || 0;
    const startB = b.startDate?.getTime() || 0;
    if (startA !== startB) return startA - startB;
    return typeOrder[a.type] - typeOrder[b.type];
  });
}
