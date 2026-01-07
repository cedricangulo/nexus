import { FastifyReply, FastifyRequest } from "fastify";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  restoreTask,
} from "./task.service.js";
import { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, TaskQuery } from "./task.schema.js";

export async function getTasksHandler(
  request: FastifyRequest<{ Querystring: TaskQuery }>,
  reply: FastifyReply
) {
  const tasks = await getTasks(request.query);
  return reply.code(200).send(tasks);
}

export async function getTaskByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const task = await getTaskById(request.params.id);
  return reply.code(200).send(task);
}

export async function createTaskHandler(
  request: FastifyRequest<{ Body: CreateTaskInput }>,
  reply: FastifyReply
) {
  const task = await createTask(request.body, request.user!.id);
  return reply.code(201).send(task);
}

export async function updateTaskHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateTaskInput }>,
  reply: FastifyReply
) {
  const task = await updateTask(request.params.id, request.body, request.user!.id, request.user!.role);
  return reply.code(200).send(task);
}

export async function updateTaskStatusHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateTaskStatusInput }>,
  reply: FastifyReply
) {
  const task = await updateTaskStatus(request.params.id, request.user!.id, request.user!.role, request.body);
  return reply.code(200).send(task);
}

export async function deleteTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  await deleteTask(request.params.id, request.user!.id);
  return reply.code(204).send();
}

export async function restoreTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const task = await restoreTask(request.params.id, request.user!.id);
  return reply.code(200).send(task);
}
