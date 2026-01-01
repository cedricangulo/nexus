// Core Types matching server Prisma schema

export const UserRole = {
  MEMBER: "MEMBER",
  TEAM_LEAD: "TEAM_LEAD",
  ADVISER: "ADVISER",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const PhaseType = {
  WATERFALL: "WATERFALL",
  SCRUM: "SCRUM",
  FALL: "FALL",
} as const;

export type PhaseType = (typeof PhaseType)[keyof typeof PhaseType];

export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  BLOCKED: "BLOCKED",
  DONE: "DONE",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const DeliverableStatus = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW: "REVIEW",
  COMPLETED: "COMPLETED",
} as const;

export type DeliverableStatus =
  (typeof DeliverableStatus)[keyof typeof DeliverableStatus];

export const DeliverableStage = {
  PLANNING: "PLANNING",
  DESIGN: "DESIGN",
  DEVELOPMENT: "DEVELOPMENT",
  TESTING: "TESTING",
  DEPLOYMENT: "DEPLOYMENT",
  GENERAL: "GENERAL",
} as const;

export type DeliverableStage =
  (typeof DeliverableStage)[keyof typeof DeliverableStage];

// User
export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

// Project
export type Project = {
  id: string;
  name: string;
  description?: string | null;
  repositoryUrl?: string | null;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Phase
export type Phase = {
  id: string;
  projectId: string;
  type: PhaseType;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface PhaseDetail extends Phase {
  deliverables: Deliverable[];
  tasks?: Task[];
  meetingLogs?: MeetingLog[];
}

// Deliverable
export type Deliverable = {
  id: string;
  phaseId: string;
  title: string;
  description?: string | null;
  status: DeliverableStatus;
  stage: DeliverableStage;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

// Sprint
export type Sprint = {
  id: string;
  projectId: string;
  number: number;
  goal?: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type SprintProgress = {
  totalTasks: number;
  completedTasks: number;
  percentage: number;
};

// Task
export type Task = {
  id: string;
  sprintId?: string | null;
  phaseId?: string | null;
  assignees?: Array<{ id: string; name: string; email: string }>;
  title: string;
  description?: string | null;
  status: TaskStatus;
  lastComment?: Comment | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

// Comment
export type Comment = {
  id: string;
  content: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    role?: string;
  };
  taskId?: string | null;
  deliverableId?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Evidence
export type Evidence = {
  id: string;
  deliverableId: string;
  uploaderId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
  deletedAt?: string | null;
};

// Meeting Log
export type MeetingLog = {
  id: string;
  sprintId?: string | null;
  phaseId?: string | null;
  title: string;
  date: string;
  fileUrl: string;
  uploaderId: string;
  uploader?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

// Activity Log
export type ActivityLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  } | null;
};

// Notification
export type Notification = {
  id: string;
  userId: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
};

// Contribution (from getUserContributions)
export type UserContribution = {
  assignedTasksCount: number;
  completedTasksCount: number;
  uploadedEvidenceCount: number;
  commentsCount: number;
};
