import { getPrismaClient, NotFoundError, ValidationError } from "../../utils/database.js";
import { CreatePhaseInput, UpdatePhaseInput } from "./phase.schema.js";
import { createActivityLog } from "../activity-log/activity-log.service.js";

const prisma = getPrismaClient();

export async function getAllPhases() {
  return prisma.phase.findMany({
    orderBy: {
      createdAt: "asc", // or by startDate?
    },
  });
}

export async function getPhaseById(id: string) {
  const phase = await prisma.phase.findUnique({
    where: { id },
    include: {
      deliverables: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          stage: true,
          dueDate: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      tasks: {
        where: {
          sprintId: null, // Only waterfall tasks
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          phaseId: true,
          sprintId: true,
          createdAt: true,
          updatedAt: true,
          assignments: {
            select: {
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
      },
      meetingLogs: {
        select: {
          id: true,
          title: true,
          date: true,
          fileUrl: true,
          uploaderId: true,
          createdAt: true,
          updatedAt: true,
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  if (!phase) {
    throw new NotFoundError("Phase", id);
  }

  // Transform tasks to match frontend Task type
  const transformedTasks = phase.tasks.map((task) => {
    const { assignments, ...taskData } = task;
    return {
      ...taskData,
      assignees: assignments.map((a) => a.user),
    };
  });

  return {
    ...phase,
    tasks: transformedTasks,
  };
}

export async function createPhase(input: CreatePhaseInput, userId: string) {
  let { projectId } = input;

  if (!projectId) {
    const project = await prisma.project.findFirst();
    if (!project) {
      throw new ValidationError("No project found. Please create a project first.");
    }
    projectId = project.id;
  }

  const phase = await prisma.phase.create({
    data: {
      ...input,
      projectId,
    },
  });

  await createActivityLog({
    userId,
    action: "PHASE_CREATED",
    entityType: "Phase",
    entityId: phase.id,
    details: `Phase "${phase.name}" created`,
  });

  return phase;
}

export async function updatePhase(id: string, input: UpdatePhaseInput, userId: string) {
  const phase = await prisma.phase.findUnique({
    where: { id },
  });

  if (!phase) {
    throw new NotFoundError("Phase", id);
  }

  const updatedPhase = await prisma.phase.update({
    where: { id },
    data: input,
  });

  await createActivityLog({
    userId,
    action: "PHASE_UPDATED",
    entityType: "Phase",
    entityId: phase.id,
    details: `Phase "${phase.name}" updated`,
  });

  return updatedPhase;
}

export async function deletePhase(id: string, userId: string) {
  const phase = await prisma.phase.findUnique({
    where: { id },
  });

  if (!phase) {
    throw new NotFoundError("Phase", id);
  }

  // Check if phase has deliverables? Maybe prevent delete if it has data?
  // Or cascade delete? Prisma usually handles cascade if configured, or throws error.
  // Let's just try to delete.

  await prisma.phase.delete({
    where: { id },
  });

  await createActivityLog({
    userId,
    action: "PHASE_DELETED",
    entityType: "Phase",
    entityId: phase.id,
    details: `Phase "${phase.name}" deleted`,
  });
}
