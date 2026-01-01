import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createEvidenceHandler, getEvidenceByDeliverableHandler, deleteEvidenceHandler, restoreEvidenceHandler } from "./evidence.controller.js";
import { evidenceResponseSchema } from "./evidence.schema.js";
import { requireRole } from "../../utils/rbac.js";
import { Role } from "../../generated/client.js";
import { z } from "zod";

export async function evidenceRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook("onRequest", app.authenticate);

    protectedServer.post(
      "/",
      {
        preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
        // We don't use Zod validation for body here because it's multipart/form-data
        // Validation happens inside the controller
      },
      createEvidenceHandler as any
    );

    protectedServer.get(
      "/deliverable/:deliverableId",
      {
        preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
        schema: {
          params: z.object({
            deliverableId: z.uuid(),
          }),
        },
      },
      getEvidenceByDeliverableHandler as any
    );

    protectedServer.delete(
      "/:id",
      {
        preHandler: [requireRole([Role.MEMBER, Role.TEAM_LEAD, Role.ADVISER])],
        schema: {
          params: z.object({
            id: z.uuid(),
          }),
        },
      },
      deleteEvidenceHandler as any
    );

    protectedServer.post(
      "/:id/restore",
      {
        preHandler: [requireRole([Role.TEAM_LEAD])],
        schema: {
          params: z.object({
            id: z.uuid(),
          }),
        },
      },
      restoreEvidenceHandler as any
    );
  });
}
