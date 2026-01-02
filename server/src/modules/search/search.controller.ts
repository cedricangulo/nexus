import { FastifyReply, FastifyRequest } from "fastify";
import { searchGlobal } from "./search.service.js";
import { SearchQuery } from "./search.schema.js";

export async function searchHandler(
  request: FastifyRequest<{ Querystring: SearchQuery }>,
  reply: FastifyReply
) {
  const { q, userId, userRole } = request.query;
  const results = await searchGlobal(q, userId, userRole);
  return reply.code(200).send(results);
}
