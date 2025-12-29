import { HttpResponse, http } from "msw";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const mockUser = {
  id: "1",
  email: "test@example.com",
  name: "Test User",
  role: "MEMBER",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  deletedAt: null,
};

export const handlers = [
  // Auth handlers
  http.post(`${BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (body.email === "server-error@example.com") {
      return HttpResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }

    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json({
        token: "mock-jwt-token",
        user: mockUser,
      });
    }

    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),

  http.get(`${BASE_URL}${API_ENDPOINTS.AUTH.ME}`, () =>
    HttpResponse.json(mockUser)
  ),

  http.post(
    `${BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`,
    () => new HttpResponse(null, { status: 200 })
  ),

  http.post(
    `${BASE_URL}${API_ENDPOINTS.AUTH.CHANGE_PASSWORD}`,
    () => new HttpResponse(null, { status: 200 })
  ),

  http.post(`${BASE_URL}${API_ENDPOINTS.AUTH.INVITE}`, async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({
      id: "new-user",
      email: body.email,
      name: body.name || "New User",
      role: body.role || "MEMBER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });
  }),

  // Project handlers
  http.get(`${BASE_URL}${API_ENDPOINTS.PROJECT.GET}`, () =>
    HttpResponse.json({
      id: "project-1",
      name: "Test Project",
      description: "Test Description",
      repositoryUrl: "https://github.com/test/test",
      startDate: "2025-01-01T00:00:00Z",
      endDate: null,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    })
  ),

  http.post(
    `${BASE_URL}${API_ENDPOINTS.PROJECT.CREATE}`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json(
        {
          id: "project-1",
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    }
  ),

  http.put(
    `${BASE_URL}${API_ENDPOINTS.PROJECT.UPDATE}`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json({
        id: "project-1",
        name: body.name || "Test Project",
        ...body,
        updatedAt: new Date().toISOString(),
      });
    }
  ),

  http.patch(
    `${BASE_URL}${API_ENDPOINTS.PROJECT.PATCH}`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json({
        id: "project-1",
        name: body.name || "Test Project",
        ...body,
        updatedAt: new Date().toISOString(),
      });
    }
  ),

  // User handlers
  http.get(`${BASE_URL}${API_ENDPOINTS.USERS.LIST}`, () =>
    HttpResponse.json([
      {
        id: "1",
        email: "user1@example.com",
        name: "User 1",
        role: "MEMBER",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        deletedAt: null,
      },
      {
        id: "2",
        email: "user2@example.com",
        name: "User 2",
        role: "TEAM_LEAD",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        deletedAt: null,
      },
    ])
  ),

  http.get(`${BASE_URL}${API_ENDPOINTS.USERS.GET(":id")}`, ({ params }) => {
    if (params.id === "not-found") {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (params.id === "server-error") {
      return HttpResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
    return HttpResponse.json({
      id: params.id,
      email: "test@example.com",
      name: "Test User",
      role: "MEMBER",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      deletedAt: null,
    });
  }),

  http.put(
    `${BASE_URL}${API_ENDPOINTS.USERS.UPDATE(":id")}`,
    async ({ params, request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json({
        id: params.id,
        email: body.email || "test@example.com",
        name: body.name || "Test User",
        role: body.role || "MEMBER",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      });
    }
  ),

  http.delete(
    `${BASE_URL}${API_ENDPOINTS.USERS.DELETE(":id")}`,
    () => new HttpResponse(null, { status: 204 })
  ),

  http.post(`${BASE_URL}${API_ENDPOINTS.USERS.RESTORE(":id")}`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      email: "test@example.com",
      name: "Test User",
      role: "MEMBER",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    })
  ),

  http.get(`${BASE_URL}${API_ENDPOINTS.USERS.CONTRIBUTIONS(":id")}`, () =>
    HttpResponse.json({
      assignedTasksCount: 5,
      completedTasksCount: 3,
      uploadedEvidenceCount: 2,
      commentsCount: 4,
    })
  ),

  // Phase handlers
  http.get(`${BASE_URL}${API_ENDPOINTS.PHASES.LIST}`, () =>
    HttpResponse.json([
      {
        id: "phase-1",
        projectId: "project-1",
        name: "Phase 1",
        type: "WATERFALL",
        description: null,
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-01-31T00:00:00Z",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
    ])
  ),

  http.get(`${BASE_URL}${API_ENDPOINTS.PHASES.GET(":id")}`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      projectId: "project-1",
      name: "Phase 1",
      type: "WATERFALL",
      description: null,
      startDate: "2025-01-01T00:00:00Z",
      endDate: "2025-01-31T00:00:00Z",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    })
  ),

  http.post(
    `${BASE_URL}${API_ENDPOINTS.PHASES.CREATE}`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json(
        {
          id: "phase-new",
          projectId: body.projectId || "project-1",
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    }
  ),

  http.put(
    `${BASE_URL}${API_ENDPOINTS.PHASES.UPDATE(":id")}`,
    async ({ params, request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json({
        id: params.id,
        projectId: "project-1",
        ...body,
        updatedAt: new Date().toISOString(),
      });
    }
  ),

  http.delete(
    `${BASE_URL}${API_ENDPOINTS.PHASES.DELETE(":id")}`,
    () => new HttpResponse(null, { status: 204 })
  ),

  // Deliverable handlers
  http.get(`${BASE_URL}${API_ENDPOINTS.DELIVERABLES.LIST}`, () =>
    HttpResponse.json([
      {
        id: "del-1",
        phaseId: "phase-1",
        title: "Deliverable 1",
        description: null,
        status: "NOT_STARTED",
        dueDate: "2025-01-15T00:00:00Z",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        deletedAt: null,
      },
    ])
  ),

  http.get(
    `${BASE_URL}${API_ENDPOINTS.DELIVERABLES.GET(":id")}`,
    ({ params }) =>
      HttpResponse.json({
        id: params.id,
        phaseId: "phase-1",
        title: "Deliverable 1",
        description: null,
        status: "NOT_STARTED",
        dueDate: "2025-01-15T00:00:00Z",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        deletedAt: null,
      })
  ),

  http.post(
    `${BASE_URL}${API_ENDPOINTS.DELIVERABLES.CREATE}`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json(
        {
          id: "del-new",
          phaseId: body.phaseId,
          ...body,
          status: body.status || "NOT_STARTED",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
        { status: 201 }
      );
    }
  ),

  http.put(
    `${BASE_URL}${API_ENDPOINTS.DELIVERABLES.UPDATE(":id")}`,
    async ({ params, request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json({
        id: params.id,
        phaseId: "phase-1",
        ...body,
        updatedAt: new Date().toISOString(),
      });
    }
  ),

  http.delete(
    `${BASE_URL}${API_ENDPOINTS.DELIVERABLES.DELETE(":id")}`,
    () => new HttpResponse(null, { status: 204 })
  ),

  http.post(
    `${BASE_URL}${API_ENDPOINTS.DELIVERABLES.RESTORE(":id")}`,
    ({ params }) =>
      HttpResponse.json({
        id: params.id,
        phaseId: "phase-1",
        title: "Deliverable 1",
        status: "NOT_STARTED",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      })
  ),

  // Sprint handlers
  http.get(`${BASE_URL}${API_ENDPOINTS.SPRINTS.LIST}`, () =>
    HttpResponse.json([
      {
        id: "sprint-1",
        projectId: "project-1",
        number: 1,
        goal: "Initial setup",
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-01-15T00:00:00Z",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        deletedAt: null,
      },
    ])
  ),

  http.get(`${BASE_URL}${API_ENDPOINTS.SPRINTS.GET(":id")}`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      projectId: "project-1",
      number: 1,
      goal: "Initial setup",
      startDate: "2025-01-01T00:00:00Z",
      endDate: "2025-01-15T00:00:00Z",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      deletedAt: null,
    })
  ),

  http.post(
    `${BASE_URL}${API_ENDPOINTS.SPRINTS.CREATE}`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json(
        {
          id: "sprint-new",
          projectId: body.projectId,
          number: 2,
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
        { status: 201 }
      );
    }
  ),

  http.put(
    `${BASE_URL}${API_ENDPOINTS.SPRINTS.UPDATE(":id")}`,
    async ({ params, request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json({
        id: params.id,
        projectId: "project-1",
        number: 1,
        ...body,
        updatedAt: new Date().toISOString(),
      });
    }
  ),

  http.delete(
    `${BASE_URL}${API_ENDPOINTS.SPRINTS.DELETE(":id")}`,
    () => new HttpResponse(null, { status: 204 })
  ),

  http.post(
    `${BASE_URL}${API_ENDPOINTS.SPRINTS.RESTORE(":id")}`,
    ({ params }) =>
      HttpResponse.json({
        id: params.id,
        projectId: "project-1",
        number: 1,
        goal: "Initial setup",
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-01-15T00:00:00Z",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      })
  ),

  http.get(`${BASE_URL}${API_ENDPOINTS.SPRINTS.PROGRESS(":id")}`, () =>
    HttpResponse.json({
      totalTasks: 10,
      completedTasks: 3,
      percentage: 30,
    })
  ),

  // Task handlers
  http.get(`${BASE_URL}${API_ENDPOINTS.TASKS.LIST}`, () =>
    HttpResponse.json([
      {
        id: "task-1",
        sprintId: "sprint-1",
        assigneeId: "1",
        title: "Task 1",
        description: null,
        status: "TODO",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        deletedAt: null,
      },
    ])
  ),

  http.get(`${BASE_URL}${API_ENDPOINTS.TASKS.GET(":id")}`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      sprintId: "sprint-1",
      assigneeId: "1",
      title: "Task 1",
      description: null,
      status: "TODO",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      deletedAt: null,
    })
  ),

  http.post(`${BASE_URL}${API_ENDPOINTS.TASKS.CREATE}`, async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json(
      {
        id: "task-new",
        sprintId: body.sprintId,
        ...body,
        status: body.status || "TODO",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
      { status: 201 }
    );
  }),

  http.put(
    `${BASE_URL}${API_ENDPOINTS.TASKS.UPDATE(":id")}`,
    async ({ params, request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json({
        id: params.id,
        sprintId: "sprint-1",
        ...body,
        updatedAt: new Date().toISOString(),
      });
    }
  ),

  http.patch(
    `${BASE_URL}${API_ENDPOINTS.TASKS.UPDATE_STATUS(":id")}`,
    async ({ params, request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json({
        id: params.id,
        status: body.status || "TODO",
        updatedAt: new Date().toISOString(),
      });
    }
  ),

  http.delete(
    `${BASE_URL}${API_ENDPOINTS.TASKS.DELETE(":id")}`,
    () => new HttpResponse(null, { status: 204 })
  ),

  http.post(`${BASE_URL}${API_ENDPOINTS.TASKS.RESTORE(":id")}`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      sprintId: "sprint-1",
      title: "Task 1",
      status: "TODO",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    })
  ),

  // Comment handlers
  http.get(`${BASE_URL}${API_ENDPOINTS.COMMENTS.LIST}`, () =>
    HttpResponse.json([
      {
        id: "comment-1",
        content: "Great work!",
        authorId: "1",
        taskId: "task-1",
        deliverableId: null,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
    ])
  ),

  http.get(`${BASE_URL}${API_ENDPOINTS.COMMENTS.GET(":id")}`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      content: "Great work!",
      authorId: "1",
      taskId: "task-1",
      deliverableId: null,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    })
  ),

  http.post(
    `${BASE_URL}${API_ENDPOINTS.COMMENTS.CREATE}`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json(
        {
          id: "comment-new",
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    }
  ),

  http.put(
    `${BASE_URL}${API_ENDPOINTS.COMMENTS.UPDATE(":id")}`,
    async ({ params, request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json({
        id: params.id,
        ...body,
        updatedAt: new Date().toISOString(),
      });
    }
  ),

  http.delete(
    `${BASE_URL}${API_ENDPOINTS.COMMENTS.DELETE(":id")}`,
    () => new HttpResponse(null, { status: 204 })
  ),

  // Evidence handlers
  http.post(
    `${BASE_URL}${API_ENDPOINTS.EVIDENCE.CREATE}`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json(
        {
          id: "evidence-new",
          deliverableId: body.deliverableId,
          uploaderId: body.uploaderId,
          fileName: body.fileName,
          fileUrl: body.fileUrl,
          fileType: body.fileType,
          createdAt: new Date().toISOString(),
          deletedAt: null,
        },
        { status: 201 }
      );
    }
  ),

  http.get(
    `${BASE_URL}${API_ENDPOINTS.EVIDENCE.BY_DELIVERABLE(":deliverableId")}`,
    () =>
      HttpResponse.json([
        {
          id: "evidence-1",
          deliverableId: "del-1",
          uploaderId: "1",
          fileName: "evidence.pdf",
          fileUrl: "https://example.com/evidence.pdf",
          fileType: "application/pdf",
          createdAt: "2025-01-01T00:00:00Z",
          deletedAt: null,
        },
      ])
  ),

  http.delete(
    `${BASE_URL}${API_ENDPOINTS.EVIDENCE.DELETE(":id")}`,
    () => new HttpResponse(null, { status: 204 })
  ),

  http.post(
    `${BASE_URL}${API_ENDPOINTS.EVIDENCE.RESTORE(":id")}`,
    ({ params }) =>
      HttpResponse.json({
        id: params.id,
        deliverableId: "del-1",
        uploaderId: "1",
        fileName: "evidence.pdf",
        fileUrl: "https://example.com/evidence.pdf",
        fileType: "application/pdf",
        createdAt: "2025-01-01T00:00:00Z",
        deletedAt: null,
      })
  ),

  // Meeting Log handlers
  http.post(
    `${BASE_URL}${API_ENDPOINTS.MEETING_LOGS.CREATE}`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, any>;
      return HttpResponse.json(
        {
          id: "meeting-new",
          sprintId: body.sprintId,
          phaseId: body.phaseId,
          title: body.title,
          date: body.date,
          fileUrl: body.fileUrl,
          uploaderId: body.uploaderId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    }
  ),

  http.get(
    `${BASE_URL}${API_ENDPOINTS.MEETING_LOGS.BY_SPRINT(":sprintId")}`,
    () =>
      HttpResponse.json([
        {
          id: "meeting-1",
          sprintId: "sprint-1",
          phaseId: null,
          title: "Sprint Planning",
          date: "2025-01-01T10:00:00Z",
          fileUrl: "https://example.com/meeting.pdf",
          uploaderId: "1",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
      ])
  ),

  http.get(
    `${BASE_URL}${API_ENDPOINTS.MEETING_LOGS.BY_PHASE(":phaseId")}`,
    () =>
      HttpResponse.json([
        {
          id: "meeting-1",
          sprintId: null,
          phaseId: "phase-1",
          title: "Phase Kickoff",
          date: "2025-01-01T10:00:00Z",
          fileUrl: "https://example.com/meeting.pdf",
          uploaderId: "1",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
      ])
  ),

  http.delete(
    `${BASE_URL}${API_ENDPOINTS.MEETING_LOGS.DELETE(":id")}`,
    () => new HttpResponse(null, { status: 204 })
  ),

  // Activity Log handlers
  http.get(`${BASE_URL}/activity-logs`, () =>
    HttpResponse.json([
      {
        id: "activity-8",
        userId: "2",
        action: "EVIDENCE_UPLOADED",
        entityType: "Deliverable",
        entityId: "del-3",
        details: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        user: {
          name: "Grace Wilsonin",
          email: "grace@example.com",
        },
      },
      {
        id: "activity-7",
        userId: "3",
        action: "EVIDENCE_UPLOADED",
        entityType: "Deliverable",
        entityId: "del-2",
        details: null,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        user: {
          name: "Henry Taylorin",
          email: "henry@example.com",
        },
      },
      {
        id: "activity-6",
        userId: "4",
        action: "EVIDENCE_UPLOADED",
        entityType: "Deliverable",
        entityId: "del-1",
        details: null,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        user: {
          name: "Bob Smithin",
          email: "bob@example.com",
        },
      },
      {
        id: "activity-5",
        userId: "1",
        action: "EVIDENCE_UPLOADED",
        entityType: "Deliverable",
        entityId: "del-4",
        details: null,
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
        user: {
          name: "Frank Millerin",
          email: "frank@example.com",
        },
      },
      {
        id: "activity-4",
        userId: "1",
        action: "EVIDENCE_UPLOADED",
        entityType: "Deliverable",
        entityId: "del-5",
        details: null,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        user: {
          name: "Frank Millerin",
          email: "frank@example.com",
        },
      },
      {
        id: "activity-3",
        userId: "5",
        action: "TASK_COMPLETED",
        entityType: "Task",
        entityId: "task-3",
        details: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        user: {
          name: "Alice Johnson",
          email: "alice@example.com",
        },
      },
      {
        id: "activity-2",
        userId: "2",
        action: "COMMENT_ADDED",
        entityType: "Deliverable",
        entityId: "del-2",
        details: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        user: {
          name: "Bob Smith",
          email: "bob@example.com",
        },
      },
      {
        id: "activity-1",
        userId: "1",
        action: "CREATED_TASK",
        entityType: "Task",
        entityId: "task-1",
        details: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        user: {
          name: "Frank Millerin",
          email: "frank@example.com",
        },
      },
    ])
  ),

  http.get(`${BASE_URL}/activity-logs/user/:userId`, () =>
    HttpResponse.json([
      {
        id: "activity-1",
        userId: "1",
        action: "CREATED_TASK",
        entityType: "Task",
        entityId: "task-1",
        details: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          name: "Frank Millerin",
          email: "frank@example.com",
        },
      },
    ])
  ),

  // Notification handlers
  http.get(`${BASE_URL}/notifications`, () =>
    HttpResponse.json([
      {
        id: "notif-1",
        userId: "1",
        message: "New task assigned",
        link: "/tasks/task-1",
        isRead: false,
        createdAt: "2025-01-01T00:00:00Z",
      },
    ])
  ),

  http.patch(`${BASE_URL}/notifications/:id/read`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      isRead: true,
    })
  ),

  // Analytics handlers
  http.get(`${BASE_URL}/analytics/project-health`, () =>
    HttpResponse.json({
      totalTasks: 50,
      completedTasks: 15,
      blockedTasks: 2,
      completionPercentage: 30,
      tasksByStatus: {
        TODO: 20,
        IN_PROGRESS: 13,
        BLOCKED: 2,
        DONE: 15,
      },
    })
  ),

  http.get(`${BASE_URL}/analytics/sprint-health/:sprintId`, () =>
    HttpResponse.json({
      sprintId: "sprint-1",
      totalTasks: 10,
      completedTasks: 3,
      completionPercentage: 30,
    })
  ),

  http.get(`${BASE_URL}/analytics/timeline`, () =>
    HttpResponse.json([
      {
        id: "phase-1",
        type: "Phase",
        name: "Planning",
        startDate: "2025-01-01",
        endDate: "2025-01-15",
        status: "IN_PROGRESS",
        progress: 50,
      },
    ])
  ),

  http.get(`${BASE_URL}/analytics/contributions`, () =>
    HttpResponse.json([
      {
        userId: "1",
        name: "User 1",
        email: "user1@example.com",
        role: "MEMBER",
        tasksAssigned: 5,
        tasksCompleted: 3,
        completionRate: 60,
      },
    ])
  ),

  // Backup handlers
  http.post(`${BASE_URL}/backup/export`, async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({
      backupId: "backup-1",
      status: "COMPLETED",
      exportedAt: new Date().toISOString(),
      size: 1024,
      format: body.format || "json",
    });
  }),

  http.post(`${BASE_URL}/backup/import`, async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    return HttpResponse.json({
      importId: "import-1",
      status: "COMPLETED",
      importedAt: new Date().toISOString(),
      importedRecords: body.importedRecords || 100,
    });
  }),
];
