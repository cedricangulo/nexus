// API Services - Main Export Index

// biome-ignore lint/performance/noBarrelFile: Intentional single entrypoint for API clients.
export { activityLogApi } from "./activity-log";
export { analyticsApi } from "./analytics";
export { authApi } from "./auth";
export { backupApi } from "./backup";
export { createApiClient } from "./client";
export { createClientSideApiClient } from "./client-side";
export { commentApi } from "./comment";
export { deliverableApi } from "./deliverable";
export * from "./endpoints";
export { evidenceApi } from "./evidence";
export { meetingLogApi } from "./meeting-log";
export { notificationApi } from "./notification";
export { phaseApi } from "./phase";
export { projectApi } from "./project";
export { searchApi } from "./search";
export { sprintApi } from "./sprint";
export { taskApi } from "./task";
export { userApi } from "./user";
