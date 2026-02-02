import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  getDashboardOverviewHandler,
  getPhaseAnalyticsHandler,
  getSprintAnalyticsHandler,
  getTeamContributionsHandler,
  getTimelineDataHandler,
  getGanttDataHandler
} from "./analytics.controller.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";

export async function analyticsRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook("onRequest", app.authenticate);

    protectedServer.get(
      "/dashboard/overview",
      {
        preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      },
      getDashboardOverviewHandler as any
    );

    protectedServer.get(
      "/dashboard/phases",
      {
        preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      },
      getPhaseAnalyticsHandler as any
    );

    protectedServer.get(
      "/dashboard/sprints",
      {
        preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      },
      getSprintAnalyticsHandler as any
    );

    protectedServer.get(
      "/dashboard/contributions",
      {
        preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      },
      getTeamContributionsHandler as any
    );

    protectedServer.get(
      "/timeline",
      {
        preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      },
      getTimelineDataHandler as any
    );

    protectedServer.get(
      "/gantt",
      {
        preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
      },
      getGanttDataHandler as any
    );
  });
}
