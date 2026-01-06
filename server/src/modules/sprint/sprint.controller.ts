import { FastifyReply, FastifyRequest } from "fastify";
import {
  getSprints,
  getSprintsByUser,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  restoreSprint,
  getSprintProgress,
} from "./sprint.service.js";
import { CreateSprintInput, UpdateSprintInput } from "./sprint.schema.js";

export async function getSprintsHandler(request: FastifyRequest, reply: FastifyReply) {
  const sprints = await getSprints();
  return reply.code(200).send(sprints);
}

export async function getSprintsByUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const sprints = await getSprintsByUser(request.user!.id);
  return reply.code(200).send(sprints);
}

export async function getSprintByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const sprint = await getSprintById(request.params.id, request.user!.id, request.user!.role);
  return reply.code(200).send(sprint);
}

export async function createSprintHandler(
  request: FastifyRequest<{ Body: CreateSprintInput }>,
  reply: FastifyReply
) {
  const sprint = await createSprint(request.body, request.user!.id);
  return reply.code(201).send(sprint);
}

export async function updateSprintHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateSprintInput }>,
  reply: FastifyReply
) {
  const sprint = await updateSprint(request.params.id, request.body, request.user!.id);
  return reply.code(200).send(sprint);
}

export async function deleteSprintHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  await deleteSprint(request.params.id, request.user!.id);
  return reply.code(204).send();
}

export async function restoreSprintHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const sprint = await restoreSprint(request.params.id, request.user!.id);
  return reply.code(200).send(sprint);
}

export async function getSprintProgressHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const progress = await getSprintProgress(request.params.id);
  return reply.code(200).send(progress);
}
