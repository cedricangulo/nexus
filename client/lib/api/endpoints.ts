/**
 * All Server API Endpoints - Reference Guide
 *
 * BASE_URL: /api/v1
 */

export const API_ENDPOINTS = {
  // Auth Endpoints
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
    INVITE: "/auth/invite",
  },

  // Project Endpoints
  PROJECT: {
    GET: "/project",
    CREATE: "/project",
    UPDATE: "/project",
    PATCH: "/project",
  },

  // User Endpoints
  USERS: {
    LIST: "/users",
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    RESTORE: (id: string) => `/users/${id}/restore`,
    CONTRIBUTIONS: (id: string) => `/users/${id}/contributions`,
  },

  // Phase Endpoints
  PHASES: {
    LIST: "/phases",
    GET: (id: string) => `/phases/${id}`,
    CREATE: "/phases",
    UPDATE: (id: string) => `/phases/${id}`,
    DELETE: (id: string) => `/phases/${id}`,
  },

  // Deliverable Endpoints
  DELIVERABLES: {
    LIST: "/deliverables",
    GET: (id: string) => `/deliverables/${id}`,
    CREATE: "/deliverables",
    UPDATE: (id: string) => `/deliverables/${id}`,
    DELETE: (id: string) => `/deliverables/${id}`,
    RESTORE: (id: string) => `/deliverables/${id}/restore`,
  },

  // Sprint Endpoints
  SPRINTS: {
    LIST: "/sprints",
    LIST_MINE: "/sprints/mine",
    GET: (id: string) => `/sprints/${id}`,
    CREATE: "/sprints",
    UPDATE: (id: string) => `/sprints/${id}`,
    DELETE: (id: string) => `/sprints/${id}`,
    RESTORE: (id: string) => `/sprints/${id}/restore`,
    PROGRESS: (id: string) => `/sprints/${id}/progress`,
  },

  // Task Endpoints
  TASKS: {
    LIST: "/tasks",
    GET: (id: string) => `/tasks/${id}`,
    CREATE: "/tasks",
    UPDATE: (id: string) => `/tasks/${id}`,
    UPDATE_STATUS: (id: string) => `/tasks/${id}/status`,
    DELETE: (id: string) => `/tasks/${id}`,
    RESTORE: (id: string) => `/tasks/${id}/restore`,
  },

  // Comment Endpoints
  COMMENTS: {
    LIST: "/comments",
    GET: (id: string) => `/comments/${id}`,
    CREATE: "/comments",
    UPDATE: (id: string) => `/comments/${id}`,
    DELETE: (id: string) => `/comments/${id}`,
  },

  // Evidence Endpoints
  EVIDENCE: {
    CREATE: "/evidence",
    CREATE_LINK: "/evidence/link",
    BY_DELIVERABLE: (deliverableId: string) =>
      `/evidence/deliverable/${deliverableId}`,
    DELETE: (id: string) => `/evidence/${id}`,
    RESTORE: (id: string) => `/evidence/${id}/restore`,
  },

  // Meeting Log Endpoints
  MEETING_LOGS: {
    CREATE: "/meeting-logs",
    BY_SPRINT: (sprintId: string) => `/meeting-logs/sprint/${sprintId}`,
    BY_PHASE: (phaseId: string) => `/meeting-logs/phase/${phaseId}`,
    DELETE: (id: string) => `/meeting-logs/${id}`,
  },

  // Activity Log Endpoints
  ACTIVITY_LOGS: {
    LIST: "/activity-logs",
    BY_ENTITY: (entityType: string, entityId: string) =>
      `/activity-logs/entity/${entityType}/${entityId}`,
  },

  // Notification Endpoints
  NOTIFICATIONS: {
    LIST: "/notifications",
    CREATE: "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
    DELETE: (id: string) => `/notifications/${id}`,
  },

  // Search Endpoints
  SEARCH: {
    GLOBAL: "/search",
  },

  // Analytics Endpoints
  ANALYTICS: {
    OVERVIEW: "/analytics/dashboard/overview",
    PHASES: "/analytics/dashboard/phases",
    SPRINTS: "/analytics/dashboard/sprints",
    CONTRIBUTIONS: "/analytics/dashboard/contributions",
    TIMELINE: "/analytics/timeline",
  },

  // Backup Endpoints
  BACKUP: {
    EXPORT: "/backup/export",
    FILES: "/backup/files",
  },

  // Device Token Endpoints (Push Notifications)
  DEVICE_TOKENS: {
    REGISTER: "/device-tokens",
    UNREGISTER: (token: string) => `/device-tokens/${token}`,
  },
} as const;

/**
 * API Methods Summary
 *
 * Auth Routes:
 * - POST   /auth/login                  - Login
 * - POST   /auth/logout                 - Logout
 * - GET    /auth/me                     - Get current user
 * - POST   /auth/change-password        - Change password
 * - POST   /auth/invite                 - Invite user (Team Lead only)
 *
 * Project Routes:
 * - GET    /project                     - Get project
 * - POST   /project                     - Create project (Team Lead only)
 * - PUT    /project                     - Update project (Team Lead only)
 * - PATCH  /project                     - Partial update project (Team Lead only)
 *
 * User Routes:
 * - GET    /users                       - List all users (Team Lead/Adviser only)
 * - GET    /users/:id                   - Get user by ID
 * - PUT    /users/:id                   - Update user
 * - DELETE /users/:id                   - Delete user (Team Lead only)
 * - GET    /users/:id/contributions     - Get user contributions
 *
 * Phase Routes:
 * - GET    /phases                      - List all phases
 * - GET    /phases/:id                  - Get phase by ID (includes deliverables)
 * - POST   /phases                      - Create phase (Team Lead only)
 * - PUT    /phases/:id                  - Update phase (Team Lead only)
 * - DELETE /phases/:id                  - Delete phase (Team Lead only)
 *
 * Deliverable Routes:
 * - GET    /deliverables                - List deliverables
 * - GET    /deliverables/:id            - Get deliverable by ID
 * - POST   /deliverables                - Create deliverable (Team Lead only)
 * - PUT    /deliverables/:id            - Update deliverable (Team Lead only)
 * - DELETE /deliverables/:id            - Delete deliverable (Team Lead only)
 * - POST   /deliverables/:id/restore    - Restore deliverable (Team Lead only)
 *
 * Sprint Routes:
 * - GET    /sprints                     - List all sprints
 * - GET    /sprints/:id                 - Get sprint by ID
 * - POST   /sprints                     - Create sprint (Team Lead only)
 * - PUT    /sprints/:id                 - Update sprint (Team Lead only)
 * - DELETE /sprints/:id                 - Delete sprint (Team Lead only)
 * - GET    /sprints/:id/progress        - Get sprint progress/health
 *
 * Task Routes:
 * - GET    /tasks                       - List tasks (with filtering)
 * - GET    /tasks/:id                   - Get task by ID
 * - POST   /tasks                       - Create task (Team Lead only)
 * - PUT    /tasks/:id                   - Update task (Team Lead only)
 * - PATCH  /tasks/:id/status            - Update task status
 * - DELETE /tasks/:id                   - Delete task (Team Lead only)
 * - POST   /tasks/:id/restore           - Restore task (Team Lead only)
 *
 * Comment Routes:
 * - GET    /comments                    - List comments (with filtering)
 * - GET    /comments/:id                - Get comment by ID
 * - POST   /comments                    - Create comment
 * - PUT    /comments/:id                - Update comment
 * - DELETE /comments/:id                - Delete comment
 *
 * Evidence Routes:
 * - POST   /evidence                    - Upload evidence (multipart/form-data)
 * - POST   /evidence/link               - Submit evidence link (JSON body)
 * - GET    /evidence/deliverable/:deliverableId - Get evidence by deliverable
 * - DELETE /evidence/:id                - Delete evidence
 *
 * Meeting Log Routes:
 * - POST   /meeting-logs                - Upload meeting log (multipart/form-data)
 * - GET    /meeting-logs/sprint/:sprintId - Get meeting logs by sprint
 * - DELETE /meeting-logs/:id            - Delete meeting log
 */
