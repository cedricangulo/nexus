import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
  getUserContributionsHandler,
  restoreUserHandler,
} from "./user.controller.js";
import { updateUserSchema, userResponseSchema, userContributionSchema } from "./user.schema.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";
import { z } from "zod";

export async function userRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook("onRequest", app.authenticate);

    // List all users (All authenticated users for display purposes)
    // Team Lead: For management + display
    // Member: For display only (see assigned users in tasks/deliverables)
    // Adviser: For display + mentions
    protectedServer.get("/", {
      schema: {
        response: {
          200: z.array(userResponseSchema),
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD, Role.MEMBER, Role.ADVISER]),
    }, getAllUsersHandler);

    // Get user by ID
    protectedServer.get("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: userResponseSchema,
        },
      },
    }, getUserByIdHandler as any);

    // Update user
    protectedServer.put("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        body: updateUserSchema,
        response: {
          200: userResponseSchema,
        },
      },
    }, updateUserHandler as any);

    // Delete user (Team Lead only)
    protectedServer.delete("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          204: z.null(),
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, deleteUserHandler as any);

    // Get user contributions
    protectedServer.get("/:id/contributions", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: userContributionSchema,
        },
      },
    }, getUserContributionsHandler as any);

    // Restore user (Team Lead only)
    protectedServer.post("/:id/restore", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: userResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, restoreUserHandler as any);
  });
}
