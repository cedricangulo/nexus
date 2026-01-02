import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { buildApp } from "../src/app.js";
import { getPrismaClient } from "../src/utils/database.js";
import bcrypt from 'bcryptjs';

const prisma = getPrismaClient();

describe("Search API", () => {
  let app: any;
  let teamLeadToken: string;
  let memberToken: string;
  let teamLeadUserId: string;
  let memberUserId: string;
  let projectId: string;
  let phaseId: string;
  let sprintId: string;

  // App setup - only once
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  }, 30000);

  // Data setup - before each test (after global beforeEach clears DB)
  beforeEach(async () => {
    // 1. Create Team Lead & Login
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const teamLead = await prisma.user.create({
      data: {
        email: 'teamlead@example.com',
        name: 'Team Lead',
        passwordHash: hashedPassword,
        role: 'TEAM_LEAD',
      },
    });
    teamLeadUserId = teamLead.id;

    const teamLeadLogin = await request(app.server)
      .post('/api/v1/auth/login')
      .send({
        email: 'teamlead@example.com',
        password: password,
      });

    teamLeadToken = teamLeadLogin.body.token;

    // 2. Create Member & Login
    const member = await prisma.user.create({
      data: {
        email: 'member@example.com',
        name: 'Team Member',
        passwordHash: hashedPassword,
        role: 'MEMBER',
      },
    });
    memberUserId = member.id;

    const memberLogin = await request(app.server)
      .post('/api/v1/auth/login')
      .send({
        email: 'member@example.com',
        password: password,
      });

    memberToken = memberLogin.body.token;

    // 3. Create Project Context
    const project = await prisma.project.create({
      data: {
        name: "Search Test Project",
        startDate: new Date(),
      }
    });
    projectId = project.id;

    const phase = await prisma.phase.create({
      data: {
        projectId,
        type: "SCRUM",
        name: "Dev Phase"
      }
    });
    phaseId = phase.id;

    const sprint = await prisma.sprint.create({
      data: {
        projectId,
        number: 1,
        startDate: new Date(),
        endDate: new Date(),
      }
    });
    sprintId = sprint.id;

    // 4. Create Test Data
    // Task assigned to member
    const memberTask = await prisma.task.create({
      data: {
        title: "Fix SuperLog bug",
        description: "The SuperLog is not logging correctly",
        status: "TODO",
        sprintId,
      }
    });

    await prisma.taskAssignment.create({
      data: {
        taskId: memberTask.id,
        userId: memberUserId,
      }
    });

    // Task assigned to team lead (not member)
    const teamLeadTask = await prisma.task.create({
      data: {
        title: "Review SuperLog implementation",
        description: "SuperLog implementation review",
        status: "IN_PROGRESS",
        sprintId,
      }
    });

    await prisma.taskAssignment.create({
      data: {
        taskId: teamLeadTask.id,
        userId: teamLeadUserId,
      }
    });

    // Unassigned task
    await prisma.task.create({
      data: {
        title: "SuperLog deployment prep",
        description: "Prepare SuperLog for deployment",
        status: "TODO",
        sprintId,
      }
    });

    // Deliverable
    await prisma.deliverable.create({
      data: {
        title: "SuperLog Design Doc",
        description: "Architecture for SuperLog",
        status: "NOT_STARTED",
        phaseId,
      }
    });

    // Comment on member's task
    await prisma.comment.create({
      data: {
        content: "I think SuperLog is ready",
        authorId: teamLeadUserId,
        taskId: memberTask.id,
      }
    });

    // Meeting Log
    await prisma.meetingLog.create({
      data: {
        title: "SuperLog Kickoff Meeting",
        date: new Date(),
        fileUrl: "http://example.com/log.pdf",
        uploaderId: teamLeadUserId,
        phaseId
      }
    });
  }, 30000);

  afterAll(async () => {
    await app.close();
  }, 30000);

  describe("Team Lead Search", () => {
    it("should return all matching items for team lead", async () => {
      if (!teamLeadToken) throw new Error("Token not set!");

      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "SuperLog", userId: teamLeadUserId, userRole: "TEAM_LEAD" })
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(3);
      expect(response.body.deliverables).toHaveLength(1);
      expect(response.body.comments).toHaveLength(1);
      expect(response.body.meetingLogs).toHaveLength(1);
    });

    it("should find tasks with various statuses for team lead", async () => {
      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "SuperLog", userId: teamLeadUserId, userRole: "TEAM_LEAD" })
        .set("Authorization", `Bearer ${teamLeadToken}`);

      const tasks = response.body.tasks;
      const statuses = tasks.map((t: any) => t.status);
      expect(statuses).toContain("TODO");
      expect(statuses).toContain("IN_PROGRESS");
    });
  });

  describe("Member Search Filtering", () => {
    it("should filter tasks to only assigned ones for member", async () => {
      if (!memberToken) throw new Error("Token not set!");

      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "SuperLog", userId: memberUserId, userRole: "MEMBER" })
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      // Member should only see 1 task (their assigned one)
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toBe("Fix SuperLog bug");
    });

    it("should hide tasks not assigned to member", async () => {
      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "SuperLog", userId: memberUserId, userRole: "MEMBER" })
        .set("Authorization", `Bearer ${memberToken}`);

      const tasks = response.body.tasks;
      const titles = tasks.map((t: any) => t.title);
      expect(titles).not.toContain("Review SuperLog implementation");
      expect(titles).not.toContain("SuperLog deployment prep");
    });

    it("should filter comments to assigned task comments only", async () => {
      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "SuperLog", userId: memberUserId, userRole: "MEMBER" })
        .set("Authorization", `Bearer ${memberToken}`);

      // Member should see comment on their assigned task
      expect(response.body.comments).toHaveLength(1);
      expect(response.body.comments[0].content).toBe("I think SuperLog is ready");
    });

    it("member should see deliverables (all members can)", async () => {
      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "SuperLog", userId: memberUserId, userRole: "MEMBER" })
        .set("Authorization", `Bearer ${memberToken}`);

      // Members can see all deliverables
      expect(response.body.deliverables).toHaveLength(1);
    });

    it("all users should see meeting logs", async () => {
      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "SuperLog", userId: memberUserId, userRole: "MEMBER" })
        .set("Authorization", `Bearer ${memberToken}`);

      expect(response.body.meetingLogs).toHaveLength(1);
    });
  });

  describe("Search Validation", () => {
    it("should return empty arrays when no matches found", async () => {
      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "NonExistentTermXYZ" })
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(0);
      expect(response.body.deliverables).toHaveLength(0);
      expect(response.body.comments).toHaveLength(0);
      expect(response.body.meetingLogs).toHaveLength(0);
    });

    it("should require authentication", async () => {
      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "SuperLog" });

      expect(response.status).toBe(401);
    });

    it("should validate empty query", async () => {
      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "" })
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(response.status).toBe(400);
    });

    it("should validate short query", async () => {
      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "ab" })
        .set("Authorization", `Bearer ${teamLeadToken}`);

      // Query is only 2 chars, min is 3
      expect(response.status).toBe(400);
    });
  });

  describe("Role Param Handling", () => {
    it("should work without userId/userRole params", async () => {
      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "SuperLog" })
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(3); // No filtering applied
    });

    it("should reject invalid role in schema validation", async () => {
      const response = await request(app.server)
        .get("/api/v1/search")
        .query({ q: "SuperLog", userId: memberUserId, userRole: "INVALID_ROLE" })
        .set("Authorization", `Bearer ${memberToken}`);

      // Schema validates enum, rejects invalid role
      expect(response.status).toBe(400);
    });
  });
});
