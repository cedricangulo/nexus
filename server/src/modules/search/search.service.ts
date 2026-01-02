import { getPrismaClient } from "../../utils/database.js";

const prisma = getPrismaClient();

export async function searchGlobal(
  query: string,
  userId?: string,
  userRole?: "TEAM_LEAD" | "MEMBER"
) {
  // Normalize search term
  const searchTerm = query.trim();

  // Determine if user is a member (needs filtering)
  const isMember = userRole === "MEMBER" && userId;

  // Run searches in parallel for better performance
  const [tasks, deliverables, comments, meetingLogs] = await Promise.all([
    // 1. Search Tasks (title or description)
    prisma.task.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: searchTerm, mode: "insensitive" } },
              { description: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
          { deletedAt: null },
          // Filter by assignment if user is a member
          isMember
            ? {
                assignments: {
                  some: { userId },
                },
              }
            : {},
        ],
      },
      select: {
        id: true,
        title: true,
        status: true,
        sprintId: true,
        createdAt: true,
      },
      take: 10,
    }),

    // 2. Search Deliverables (title or description)
    prisma.deliverable.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: searchTerm, mode: "insensitive" } },
              { description: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
          { deletedAt: null },
          // Members see all deliverables (they may need to review team deliverables)
        ],
      },
      select: {
        id: true,
        title: true,
        status: true,
        phaseId: true,
        createdAt: true,
      },
      take: 10,
    }),

    // 3. Search Comments (content)
    prisma.comment.findMany({
      where: {
        AND: [
          { content: { contains: searchTerm, mode: "insensitive" } },
          // Filter comments: members only see comments on their assigned tasks
          isMember
            ? {
                task: {
                  assignments: {
                    some: { userId },
                  },
                },
              }
            : {},
        ],
      },
      select: {
        id: true,
        content: true,
        author: {
          select: { name: true },
        },
        taskId: true,
        deliverableId: true,
        createdAt: true,
      },
      take: 10,
    }),

    // 4. Search Meeting Logs (title)
    // All users can search meeting logs
    prisma.meetingLog.findMany({
      where: {
        title: { contains: searchTerm, mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        date: true,
        fileUrl: true,
      },
      take: 10,
    }),
  ]);

  return {
    tasks,
    deliverables,
    comments: comments.map(c => ({
        ...c,
        authorName: c.author.name
    })),
    meetingLogs,
  };
}
