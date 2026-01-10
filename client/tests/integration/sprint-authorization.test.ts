import { describe, expect, it } from "vitest";
import type { Task, User } from "@/lib/types";

// Authorization logic tests don't need next/navigation mocks
// since they test the logic directly, not the page component

// Simulate the authorization logic from the sprint page
async function validateSprintAccess(
  user: User,
  tasks: Task[]
): Promise<{ authorized: boolean; reason?: string }> {
  // Check: Member role gate
  if (user.role !== "MEMBER") {
    return { authorized: false, reason: "NOT_MEMBER_ROLE" };
  }

  // Check: Member has at least one assigned task in the sprint
  const userTasks = tasks.filter((task) =>
    task.assignees?.some((a) => a.id === user.id)
  );

  if (userTasks.length === 0) {
    return { authorized: false, reason: "NO_ASSIGNED_TASKS" };
  }

  return { authorized: true };
}

describe("Sprint Detail Page Authorization", () => {
  const mockMember: User = {
    id: "user-1",
    email: "member@example.com",
    name: "Team Member",
    role: "MEMBER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockTeamLead: User = {
    id: "user-2",
    email: "lead@example.com",
    name: "Team Lead",
    role: "TEAM_LEAD",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockAssignedTask: Task = {
    id: "task-1",
    title: "Task 1",
    description: "Test task",
    status: "TODO",
    sprintId: "sprint-1",
    phaseId: null,
    assignees: [{ id: mockMember.id, name: mockMember.name, email: mockMember.email }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUnassignedTask: Task = {
    id: "task-2",
    title: "Task 2",
    description: "Another task",
    status: "IN_PROGRESS",
    sprintId: "sprint-1",
    phaseId: null,
    assignees: [
      {
        id: "other-user",
        email: "",
        name: "",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe("Member Authorization", () => {
    it("should allow member with assigned tasks in sprint", async () => {
      const result = await validateSprintAccess(mockMember, [mockAssignedTask]);

      expect(result.authorized).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("should deny member with no assigned tasks", async () => {
      const result = await validateSprintAccess(mockMember, [
        mockUnassignedTask,
      ]);

      expect(result.authorized).toBe(false);
      expect(result.reason).toBe("NO_ASSIGNED_TASKS");
    });

    it("should allow member with at least one assigned task among many", async () => {
      const result = await validateSprintAccess(mockMember, [
        mockUnassignedTask,
        mockAssignedTask,
        mockUnassignedTask,
      ]);

      expect(result.authorized).toBe(true);
    });
  });

  describe("Team Lead Authorization", () => {
    it("should deny team lead from accessing member sprint page", async () => {
      const result = await validateSprintAccess(mockTeamLead, [
        mockAssignedTask,
      ]);

      expect(result.authorized).toBe(false);
      expect(result.reason).toBe("NOT_MEMBER_ROLE");
    });
  });

  describe("Empty Sprint Authorization", () => {
    it("should deny access to empty sprint (no tasks)", async () => {
      const result = await validateSprintAccess(mockMember, []);

      expect(result.authorized).toBe(false);
      expect(result.reason).toBe("NO_ASSIGNED_TASKS");
    });

    it("should deny access when all tasks assigned to others", async () => {
      const result = await validateSprintAccess(mockMember, [
        mockUnassignedTask,
      ]);

      expect(result.authorized).toBe(false);
      expect(result.reason).toBe("NO_ASSIGNED_TASKS");
    });
  });

  describe("Multiple Assignees", () => {
    it("should allow member when assigned along with others", async () => {
      const sharedTask: Task = {
        ...mockAssignedTask,
        assignees: [
          { id: mockMember.id, name: mockMember.name, email: mockMember.email },
          {
            id: "other-user",
            email: "other@example.com",
            name: "Other User",
          },
        ],
      };

      const result = await validateSprintAccess(mockMember, [sharedTask]);

      expect(result.authorized).toBe(true);
    });

    it("should deny member not in shared task assignees", async () => {
      const sharedTask: Task = {
        ...mockUnassignedTask,
        assignees: [
          {
            id: "user-3",
            email: "user3@example.com",
            name: "User 3",
          },
          {
            id: "user-4",
            email: "user4@example.com",
            name: "User 4",
          },
        ],
      };

      const result = await validateSprintAccess(mockMember, [sharedTask]);

      expect(result.authorized).toBe(false);
    });
  });

  describe("Task Status Variations", () => {
    it("should allow access regardless of task status (TODO)", async () => {
      const todoTask = { ...mockAssignedTask, status: "TODO" as const };
      const result = await validateSprintAccess(mockMember, [todoTask]);

      expect(result.authorized).toBe(true);
    });

    it("should allow access regardless of task status (IN_PROGRESS)", async () => {
      const inProgressTask = { ...mockAssignedTask, status: "IN_PROGRESS" as const };
      const result = await validateSprintAccess(mockMember, [inProgressTask]);

      expect(result.authorized).toBe(true);
    });

    it("should allow access regardless of task status (DONE)", async () => {
      const doneTask = { ...mockAssignedTask, status: "DONE" as const };
      const result = await validateSprintAccess(mockMember, [doneTask]);

      expect(result.authorized).toBe(true);
    });

    it("should allow access regardless of task status (BLOCKED)", async () => {
      const blockedTask = { ...mockAssignedTask, status: "BLOCKED" as const };
      const result = await validateSprintAccess(mockMember, [blockedTask]);

      expect(result.authorized).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined assignees", async () => {
      const taskWithoutAssignees = { ...mockAssignedTask, assignees: undefined };
      const result = await validateSprintAccess(mockMember, [
        taskWithoutAssignees,
      ]);

      expect(result.authorized).toBe(false);
    });

    it("should handle undefined assignees", async () => {
      const taskWithoutAssignees = {
        ...mockAssignedTask,
        assignees: undefined,
      };
      const result = await validateSprintAccess(mockMember, [
        taskWithoutAssignees,
      ]);

      expect(result.authorized).toBe(false);
    });

    it("should handle empty assignees array", async () => {
      const taskWithoutAssignees = { ...mockAssignedTask, assignees: [] };
      const result = await validateSprintAccess(mockMember, [
        taskWithoutAssignees,
      ]);

      expect(result.authorized).toBe(false);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle sprint with mix of assigned and unassigned tasks", async () => {
      const tasks: Task[] = [
        mockAssignedTask,
        mockUnassignedTask,
        {
          ...mockAssignedTask,
          id: "task-3",
          assignees: [mockMember],
        },
      ];

      const result = await validateSprintAccess(mockMember, tasks);

      expect(result.authorized).toBe(true);
    });

    it("should deny when only one task and user not assigned", async () => {
      const result = await validateSprintAccess(mockMember, [
        mockUnassignedTask,
      ]);

      expect(result.authorized).toBe(false);
    });

    it("should allow when even one task is assigned", async () => {
      const tasks: Task[] = [
        mockUnassignedTask,
        mockUnassignedTask,
        mockAssignedTask,
        mockUnassignedTask,
      ];

      const result = await validateSprintAccess(mockMember, tasks);

      expect(result.authorized).toBe(true);
    });
  });

  describe("Different Member IDs", () => {
    it("should match member by exact ID", async () => {
      const differentMember: User = {
        ...mockMember,
        id: "different-member-id",
      };

      const result = await validateSprintAccess(differentMember, [
        mockAssignedTask,
      ]);

      expect(result.authorized).toBe(false);
    });

    it("should correctly identify multiple different members", async () => {
      const member1 = { ...mockMember, id: "member-1" };
      const member2 = { ...mockMember, id: "member-2" };

      const taskForMember1 = {
        ...mockAssignedTask,
        assignees: [member1],
      };

      const result1 = await validateSprintAccess(member1, [taskForMember1]);
      const result2 = await validateSprintAccess(member2, [taskForMember1]);

      expect(result1.authorized).toBe(true);
      expect(result2.authorized).toBe(false);
    });
  });
});
