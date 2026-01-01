import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { UpdateUserInput } from "./user.schema.js";
import { TaskStatus } from "../../generated/client.js";
import { createActivityLog } from "../activity-log/activity-log.service.js";

const prisma = getPrismaClient();

export async function getAllUsers() {
  return prisma.user.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError("User", id);
  }

  return user;
}

export async function updateUser(id: string, input: UpdateUserInput, actorId: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError("User", id);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: input,
  });

  await createActivityLog({
    userId: actorId,
    action: "USER_UPDATED",
    entityType: "User",
    entityId: user.id,
    details: `User "${user.name}" updated`,
  });

  return updatedUser;
}

export async function deleteUser(id: string, actorId: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError("User", id);
  }

  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  await createActivityLog({
    userId: actorId,
    action: "USER_DELETED",
    entityType: "User",
    entityId: user.id,
    details: `User "${user.name}" deleted`,
  });
}

export async function restoreUser(id: string, actorId: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError("User", id);
  }

  if (user.deletedAt === null) {
    // User is not soft-deleted, nothing to restore. Could throw an error or just return.
    // For now, let's just return the user if not deleted.
    return user;
  }

  const restoredUser = await prisma.user.update({
    where: { id },
    data: {
      deletedAt: null,
    },
  });

  await createActivityLog({
    userId: actorId,
    action: "USER_RESTORED",
    entityType: "User",
    entityId: user.id,
    details: `User "${user.name}" restored`,
  });

  return restoredUser;
}

export async function getUserContributions(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError("User", id);
  }

  const [assignedTasksCount, completedTasksCount, uploadedEvidenceCount, commentsCount] = await Promise.all([
    prisma.taskAssignment.count({
      where: {
        userId: id,
        task: { deletedAt: null }
      },
    }),
    prisma.taskAssignment.count({
      where: {
        userId: id,
        task: { status: TaskStatus.DONE, deletedAt: null }
      },
    }),
    prisma.evidence.count({
      where: { uploaderId: id, deletedAt: null },
    }),
    prisma.comment.count({
      where: { authorId: id },
    }),
  ]);

  return {
    assignedTasksCount,
    completedTasksCount,
    uploadedEvidenceCount,
    commentsCount,
  };
}
