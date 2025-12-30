import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { getPrismaClient } from "../../src/utils/database";
import { clearDatabase } from "../helpers/reset-db";
import { hashPassword } from "../../src/utils/hash";
import { FastifyInstance } from "fastify";
import { TaskStatus } from "../../src/generated/client";

describe("Task Integration Tests", () => {
  let app: FastifyInstance;
  let request: any;
  let teamLeadToken: string;
  let memberToken: string;
  let memberId: string;
  let member2Id: string;
  let projectId: string;
  let sprintId: string;
  let phaseId: string;
  const prisma = getPrismaClient();

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    request = supertest(app.server);
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create a Team Lead
    const teamLead = await prisma.user.upsert({
      where: { email: "lead@example.com" },
      update: {},
      create: {
        email: "lead@example.com",
        passwordHash: await hashPassword("password123"),
        name: "Team Lead",
        role: "TEAM_LEAD",
      },
    });

    // Login as Team Lead
    const leadLogin = await request.post("/api/v1/auth/login").send({
      email: "lead@example.com",
      password: "password123",
    });
    teamLeadToken = leadLogin.body.token;

    // Create Member 1
    const member = await prisma.user.upsert({
      where: { email: "member@example.com" },
      update: {},
      create: {
        email: "member@example.com",
        passwordHash: await hashPassword("password123"),
        name: "Member",
        role: "MEMBER",
      },
    });
    memberId = member.id;

    // Create Member 2
    const member2 = await prisma.user.upsert({
      where: { email: "member2@example.com" },
      update: {},
      create: {
        email: "member2@example.com",
        passwordHash: await hashPassword("password123"),
        name: "Member 2",
        role: "MEMBER",
      },
    });
    member2Id = member2.id;

    // Login as Member
    const memberLogin = await request.post("/api/v1/auth/login").send({
      email: "member@example.com",
      password: "password123",
    });
    memberToken = memberLogin.body.token;

    // Create Project, Phase and Sprint
    const project = await prisma.project.create({
      data: {
        name: "Test Project",
        startDate: new Date(),
      },
    });
    projectId = project.id;

    const phase = await prisma.phase.create({
      data: {
        projectId,
        type: "WATERFALL",
        name: "Planning Phase",
      },
    });
    phaseId = phase.id;

    const sprint = await prisma.sprint.create({
      data: {
        projectId,
        number: 1,
        startDate: new Date(),
        endDate: new Date(),
      },
    });
    sprintId = sprint.id;
  }, 30000);

  describe("POST /api/v1/tasks", () => {
    it("should create a sprint task with multiple assignees", async () => {
      const res = await request
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          sprintId,
          title: "New Sprint Task",
          description: "Task description",
          status: TaskStatus.TODO,
          assigneeIds: [memberId, member2Id],
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("New Sprint Task");
      expect(res.body.sprintId).toBe(sprintId);
      expect(res.body.assignees).toHaveLength(2);
      expect(res.body.assignees.map((a: any) => a.id)).toContain(memberId);
      expect(res.body.assignees.map((a: any) => a.id)).toContain(member2Id);
      expect(res.body.id).toBeDefined();
    });

    it("should create a phase task when authenticated as TEAM_LEAD", async () => {
      const res = await request
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          phaseId,
          title: "New Phase Task",
          description: "Task description",
          status: TaskStatus.TODO,
          assigneeIds: [memberId],
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("New Phase Task");
      expect(res.body.phaseId).toBe(phaseId);
      expect(res.body.sprintId).toBeNull();
      expect(res.body.assignees).toHaveLength(1);
      expect(res.body.assignees[0].id).toBe(memberId);
      expect(res.body.id).toBeDefined();
    });

    it("should create a task without assignees", async () => {
      const res = await request
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          sprintId,
          title: "Unassigned Task",
          status: TaskStatus.TODO,
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Unassigned Task");
      expect(res.body.assignees).toHaveLength(0);
    });

    it("should fail if neither sprintId nor phaseId is provided", async () => {
      const res = await request
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          title: "Orphan Task",
          status: TaskStatus.TODO,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Either sprintId or phaseId must be provided");
    });

    it("should fail if user is not TEAM_LEAD", async () => {
      const res = await request
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          sprintId,
          title: "Unauthorized Task",
          status: TaskStatus.TODO,
        });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/tasks", () => {
    it("should list tasks filtered by sprint", async () => {
      await prisma.task.create({
        data: {
          sprintId,
          title: "Sprint Task 1",
          status: TaskStatus.TODO,
        },
      });

      const res = await request
        .get(`/api/v1/tasks?sprintId=${sprintId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe("Sprint Task 1");
      expect(res.body[0].assignees).toBeDefined();
    });

    it("should list tasks filtered by assignee", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "Assigned Task",
          status: TaskStatus.TODO,
          assignments: {
            create: [{ userId: memberId }],
          },
        },
      });

      // Create another task without this assignee
      await prisma.task.create({
        data: {
          sprintId,
          title: "Other Task",
          status: TaskStatus.TODO,
        },
      });

      const res = await request
        .get(`/api/v1/tasks?assigneeId=${memberId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe("Assigned Task");
    });

    it("should list tasks filtered by phase", async () => {
      await prisma.task.create({
        data: {
          phaseId,
          title: "Phase Task 1",
          status: TaskStatus.TODO,
        },
      });

      const res = await request
        .get(`/api/v1/tasks?phaseId=${phaseId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe("Phase Task 1");
    });
  });

  describe("GET /api/v1/tasks/:id", () => {
    it("should return a specific task with assignees", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "Target Task",
          status: TaskStatus.IN_PROGRESS,
          assignments: {
            create: [{ userId: memberId }, { userId: member2Id }],
          },
        },
      });

      const res = await request
        .get(`/api/v1/tasks/${task.id}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(task.id);
      expect(res.body.title).toBe("Target Task");
      expect(res.body.assignees).toHaveLength(2);
    });
  });

  describe("PUT /api/v1/tasks/:id", () => {
    it("should update a task", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "Old Title",
          status: TaskStatus.TODO,
        },
      });

      const res = await request
        .put(`/api/v1/tasks/${task.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          title: "Updated Title",
          status: TaskStatus.IN_PROGRESS,
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Title");
      expect(res.body.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it("should update task assignees", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "Task with Assignees",
          status: TaskStatus.TODO,
          assignments: {
            create: [{ userId: memberId }],
          },
        },
      });

      const res = await request
        .put(`/api/v1/tasks/${task.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          assigneeIds: [member2Id],
        });

      expect(res.status).toBe(200);
      expect(res.body.assignees).toHaveLength(1);
      expect(res.body.assignees[0].id).toBe(member2Id);

      // Verify notification was created for new assignee
      const notifications = await prisma.notification.findMany({
        where: { userId: member2Id },
      });
      expect(notifications.length).toBeGreaterThan(0);
    });
  });

  describe("PATCH /api/v1/tasks/:id/status", () => {
    it("should update task status", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "Status Task",
          status: TaskStatus.TODO,
          assignments: {
            create: [{ userId: memberId }],
          },
        },
      });

      const res = await request
        .patch(`/api/v1/tasks/${task.id}/status`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          status: TaskStatus.DONE,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(TaskStatus.DONE);
    });

    it("should fail if status is BLOCKED without comment", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "Blocked Task",
          status: TaskStatus.IN_PROGRESS,
          assignments: {
            create: [{ userId: memberId }],
          },
        },
      });

      const res = await request
        .patch(`/api/v1/tasks/${task.id}/status`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          status: TaskStatus.BLOCKED,
          // Missing comment
        });

      expect(res.status).toBe(400);
    });

    it("should notify Team Leads when task is blocked", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "Blocked Task",
          status: TaskStatus.IN_PROGRESS,
          assignments: {
            create: [{ userId: memberId }],
          },
        },
      });

      const res = await request
        .patch(`/api/v1/tasks/${task.id}/status`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          status: TaskStatus.BLOCKED,
          comment: "Waiting for API response",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(TaskStatus.BLOCKED);

      // Verify notification was created for Team Lead
      const notifications = await prisma.notification.findMany({
        where: {
          message: { contains: "blocked" },
        },
      });

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].message).toContain("Blocked Task");
      expect(notifications[0].message).toContain("Waiting for API response");
    });
  });

  describe("DELETE /api/v1/tasks/:id", () => {
    it("should soft delete a task", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "To Delete",
          status: TaskStatus.TODO,
        },
      });

      const res = await request
        .delete(`/api/v1/tasks/${task.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(204);

      const check = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(check).not.toBeNull();
      if (check) {
        expect(check.deletedAt).not.toBeNull();
      }
    });
  });

  describe("POST /api/v1/tasks/:id/restore", () => {
    it("should restore a soft-deleted task", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "To Restore",
          status: TaskStatus.TODO,
          deletedAt: new Date(),
        },
      });

      const res = await request
        .post(`/api/v1/tasks/${task.id}/restore`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(200);
      expect(res.body.deletedAt).toBeNull();

      const check = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(check).not.toBeNull();
      if (check) {
        expect(check.deletedAt).toBeNull();
      }
    });
  });
});
