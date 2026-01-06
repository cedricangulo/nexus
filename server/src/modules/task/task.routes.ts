import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  getTasksHandler,
  getTaskByIdHandler,
  createTaskHandler,
  updateTaskHandler,
  updateTaskStatusHandler,
  deleteTaskHandler,
  restoreTaskHandler,
} from "./task.controller.js";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskResponseSchema,
  taskQuerySchema,
} from "./task.schema.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";
import { z } from "zod";

export async function taskRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook("onRequest", app.authenticate);

    // List tasks
    protectedServer.get("/", {
      schema: {
        querystring: taskQuerySchema,
        response: {
          200: z.array(taskResponseSchema),
        },
      },
    }, getTasksHandler as any);

    // Get task by ID
    protectedServer.get("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: taskResponseSchema,
        },
      },
    }, getTaskByIdHandler as any);

    // Create task (Team Lead only)
    protectedServer.post("/", {
      schema: {
        body: createTaskSchema,
        response: {
          201: taskResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, createTaskHandler as any);

    // Update task (Team Lead only for assignments, Members can update details)
    protectedServer.put("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        body: updateTaskSchema,
        response: {
          200: taskResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD, Role.MEMBER]),
    }, updateTaskHandler as any);

    // Update task status
    protectedServer.patch("/:id/status", {
      schema: {
        params: z.object({ id: z.string() }),
        body: updateTaskStatusSchema,
        response: {
          200: taskResponseSchema,
        },
      },
    }, updateTaskStatusHandler as any);

    // Delete task (Team Lead only)
    protectedServer.delete("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          204: z.null(),
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, deleteTaskHandler as any);

    // Restore task (Team Lead only)
    protectedServer.post("/:id/restore", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: taskResponseSchema,
        },
      },
      preHandler: requireRole([Role.TEAM_LEAD]),
    }, restoreTaskHandler as any);
  });
}
