import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, TaskQuery } from "./task.schema.js";
import { createNotification } from "../notification/notification.service.js";
import { createActivityLog } from "../activity-log/activity-log.service.js";

const prisma = getPrismaClient();

// Helper to transform task with assignments to response format
function transformTaskToResponse(task: any) {
  const { assignments, comments, ...taskWithoutRelations } = task;
  return {
    ...taskWithoutRelations,
    assignees: assignments?.map((a: any) => ({
      id: a.user.id,
      name: a.user.name,
      email: a.user.email,
    })) || [],
    lastComment: comments?.[0] || null,
  };
}

export async function getTasks(query: TaskQuery) {
  const { sprintId, phaseId, assigneeId, status } = query;

  const tasks = await prisma.task.findMany({
    where: {
      sprintId,
      phaseId,
      status,
      deletedAt: null,
      // Filter by assignee if provided
      ...(assigneeId && {
        assignments: {
          some: { userId: assigneeId },
        },
      }),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      comments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return tasks.map(transformTaskToResponse);
}

export async function getTaskById(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      comments: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!task || task.deletedAt) {
    throw new NotFoundError("Task", id);
  }

  return transformTaskToResponse(task);
}

export async function createTask(input: CreateTaskInput, creatorId: string) {
  // Validate Sprint OR Phase
  if (input.sprintId) {
    const sprint = await prisma.sprint.findUnique({ where: { id: input.sprintId } });
    if (!sprint) throw new NotFoundError("Sprint", input.sprintId);
  } else if (input.phaseId) {
    const phase = await prisma.phase.findUnique({ where: { id: input.phaseId } });
    if (!phase) throw new NotFoundError("Phase", input.phaseId);
  } else {
    throw new Error("Task must be linked to a Sprint or a Phase");
  }

  const { assigneeIds, ...taskData } = input;

  const task = await prisma.task.create({
    data: {
      ...taskData,
      assignments: assigneeIds && assigneeIds.length > 0
        ? {
          create: assigneeIds.map(userId => ({ userId })),
        }
        : undefined,
    },
    include: {
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Activity Log
  await createActivityLog({
    userId: creatorId,
    action: "TASK_CREATED",
    entityType: "Task",
    entityId: task.id,
    details: `Task "${task.title}" created`,
  });

  // Notify all assignees except the creator
  if (assigneeIds && assigneeIds.length > 0) {
    for (const assigneeId of assigneeIds) {
      if (assigneeId !== creatorId) {
        await createNotification({
          userId: assigneeId,
          message: `You have been assigned to task: ${task.title}`,
          link: `/tasks/${task.id}`,
        });
      }
    }
  }

  return transformTaskToResponse({ ...task, comments: [] });
}

export async function updateTask(id: string, input: UpdateTaskInput, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignments: true,
    },
  });

  if (!task || task.deletedAt) {
    throw new NotFoundError("Task", id);
  }

  const { assigneeIds, ...updateData } = input;

  // Start a transaction to update task and assignments
  const updatedTask = await prisma.$transaction(async (tx) => {
    // Update task fields
    const updated = await tx.task.update({
      where: { id },
      data: updateData,
    });

    // Update assignments if provided
    if (assigneeIds !== undefined) {
      const currentAssigneeIds = task.assignments.map(a => a.userId);
      const newAssigneeIds = assigneeIds;

      // Find assignees to remove and add
      const toRemove = currentAssigneeIds.filter(id => !newAssigneeIds.includes(id));
      const toAdd = newAssigneeIds.filter(id => !currentAssigneeIds.includes(id));

      // Remove old assignments
      if (toRemove.length > 0) {
        await tx.taskAssignment.deleteMany({
          where: {
            taskId: id,
            userId: { in: toRemove },
          },
        });
      }

      // Add new assignments
      if (toAdd.length > 0) {
        await tx.taskAssignment.createMany({
          data: toAdd.map(userId => ({ taskId: id, userId })),
        });
      }

      // Notify new assignees
      for (const assigneeId of toAdd) {
        if (assigneeId !== userId) {
          await createNotification({
            userId: assigneeId,
            message: `You have been assigned to task: ${updated.title}`,
            link: `/tasks/${updated.id}`,
          });
        }
      }
    }

    return updated;
  });

  // Activity Log
  await createActivityLog({
    userId,
    action: "TASK_UPDATED",
    entityType: "Task",
    entityId: task.id,
    details: `Task "${task.title}" updated`,
  });

  // Fetch the updated task with all relations
  return getTaskById(id);
}

export async function updateTaskStatus(id: string, userId: string, input: UpdateTaskStatusInput) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignments: true,
    },
  });

  if (!task || task.deletedAt) {
    throw new NotFoundError("Task", id);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedTask = await tx.task.update({
      where: { id },
      data: {
        status: input.status,
      },
    });

    if (input.comment) {
      await tx.comment.create({
        data: {
          content: input.comment,
          taskId: id,
          authorId: userId,
        },
      });
    }

    return updatedTask;
  });

  // Activity Log
  await createActivityLog({
    userId,
    action: "TASK_STATUS_CHANGED",
    entityType: "Task",
    entityId: task.id,
    details: `Task "${task.title}" status changed to ${input.status}`,
  });

  // Notify all assignees if someone else changed status
  const assigneeIds = task.assignments.map(a => a.userId);
  for (const assigneeId of assigneeIds) {
    if (assigneeId !== userId) {
      await createNotification({
        userId: assigneeId,
        message: `Task "${task.title}" status updated to ${input.status}`,
        link: `/tasks/${task.id}`,
      });
    }
  }

  // Blocker notification: notify all Team Leads when a task is blocked
  if (input.status === "BLOCKED") {
    const teamLeads = await prisma.user.findMany({
      where: {
        role: "TEAM_LEAD",
        deletedAt: null,
      },
      select: { id: true },
    });

    // Get the user who blocked it for the message
    const blocker = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    for (const lead of teamLeads) {
      // Don't notify the person who blocked it if they are a Team Lead
      if (lead.id !== userId) {
        await createNotification({
          userId: lead.id,
          message: `🚫 Task "${task.title}" was blocked by ${blocker?.name || 'a team member'}${input.comment ? `: "${input.comment}"` : ''}`,
          link: `/tasks/${task.id}`,
        });
      }
    }
  }

  return getTaskById(id);
}

export async function deleteTask(id: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task || task.deletedAt) {
    throw new NotFoundError("Task", id);
  }

  await prisma.task.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  await createActivityLog({
    userId,
    action: "TASK_DELETED",
    entityType: "Task",
    entityId: task.id,
    details: `Task "${task.title}" deleted`,
  });
}

export async function restoreTask(id: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    throw new NotFoundError("Task", id);
  }

  if (!task.deletedAt) {
    return getTaskById(id);
  }

  await prisma.task.update({
    where: { id },
    data: {
      deletedAt: null,
    },
  });

  await createActivityLog({
    userId,
    action: "TASK_RESTORED",
    entityType: "Task",
    entityId: task.id,
    details: `Task "${task.title}" restored`,
  });

  return getTaskById(id);
}
