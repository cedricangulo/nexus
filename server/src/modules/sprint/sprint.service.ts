import { getPrismaClient, NotFoundError, ValidationError } from "../../utils/database.js";
import { CreateSprintInput, UpdateSprintInput } from "./sprint.schema.js";
import { TaskStatus } from "../../generated/client.js";
import { createActivityLog } from "../activity-log/activity-log.service.js";

const prisma = getPrismaClient();

export async function getSprints() {
  return prisma.sprint.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      startDate: "desc",
    },
  });
}

export async function getSprintsByUser(userId: string) {
  // Get all sprints where the user has assigned tasks
  return prisma.sprint.findMany({
    where: {
      deletedAt: null,
      tasks: {
        some: {
          assignments: {
            some: { userId },
          },
          deletedAt: null,
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });
}

export async function getSprintById(id: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id },
    include: {
      tasks: true,
    },
  });

  if (!sprint || sprint.deletedAt) {
    throw new NotFoundError("Sprint", id);
  }

  return sprint;
}

export async function createSprint(input: CreateSprintInput, userId: string) {
  let { projectId } = input;

  if (!projectId) {
    const project = await prisma.project.findFirst();
    if (!project) {
      throw new ValidationError("No project found. Please create a project first.");
    }
    projectId = project.id;
  }

  const lastSprint = await prisma.sprint.findFirst({
    where: { projectId },
    orderBy: { number: 'desc' },
  });

  const nextNumber = input.number ?? (lastSprint?.number ?? 0) + 1;

  const sprint = await prisma.sprint.create({
    data: {
      projectId,
      number: nextNumber,
      goal: input.goal,
      startDate: input.startDate,
      endDate: input.endDate,
    },
  });

  await createActivityLog({
    userId,
    action: "SPRINT_CREATED",
    entityType: "Sprint",
    entityId: sprint.id,
    details: `Sprint ${sprint.number} created`,
  });

  return sprint;
}

export async function updateSprint(id: string, input: UpdateSprintInput, userId: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id },
  });

  if (!sprint || sprint.deletedAt) {
    throw new NotFoundError("Sprint", id);
  }

  const updatedSprint = await prisma.sprint.update({
    where: { id },
    data: input,
  });

  await createActivityLog({
    userId,
    action: "SPRINT_UPDATED",
    entityType: "Sprint",
    entityId: sprint.id,
    details: `Sprint ${sprint.number} updated`,
  });

  return updatedSprint;
}

export async function deleteSprint(id: string, userId: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id },
  });

  if (!sprint || sprint.deletedAt) {
    throw new NotFoundError("Sprint", id);
  }

  await prisma.sprint.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  await createActivityLog({
    userId,
    action: "SPRINT_DELETED",
    entityType: "Sprint",
    entityId: sprint.id,
    details: `Sprint ${sprint.number} deleted`,
  });
}

export async function restoreSprint(id: string, userId: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id },
  });

  if (!sprint) {
    throw new NotFoundError("Sprint", id);
  }

  if (sprint.deletedAt === null) {
    return sprint;
  }

  const restoredSprint = await prisma.sprint.update({
    where: { id },
    data: {
      deletedAt: null,
    },
  });

  await createActivityLog({
    userId,
    action: "SPRINT_RESTORED",
    entityType: "Sprint",
    entityId: sprint.id,
    details: `Sprint ${sprint.number} restored`,
  });

  return restoredSprint;
}

export async function getSprintProgress(id: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id },
  });

  if (!sprint || sprint.deletedAt) {
    throw new NotFoundError("Sprint", id);
  }

  const totalTasks = await prisma.task.count({
    where: { sprintId: id, deletedAt: null },
  });

  const completedTasks = await prisma.task.count({
    where: { sprintId: id, status: TaskStatus.DONE, deletedAt: null },
  });

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    percentage,
  };
}
