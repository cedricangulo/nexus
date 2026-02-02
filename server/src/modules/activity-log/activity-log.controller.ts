import { FastifyReply, FastifyRequest } from "fastify";
import { getAllActivityLogs, getActivityLogsByEntity, getActivityLogsByUser } from "./activity-log.service.js";

export async function getAllActivityLogsHandler(request: FastifyRequest, reply: FastifyReply) {
  const logs = await getAllActivityLogs();
  return reply.code(200).send(logs);
}

export async function getActivityLogsByEntityHandler(request: FastifyRequest<{ Params: { entityType: string; entityId: string } }>, reply: FastifyReply) {
  const { entityType, entityId } = request.params;
  const logs = await getActivityLogsByEntity(entityType, entityId);
  return reply.code(200).send(logs);
}

export async function getMyActivityLogsHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user!.id;
  const logs = await getActivityLogsByUser(userId);
  return reply.code(200).send(logs);
}
