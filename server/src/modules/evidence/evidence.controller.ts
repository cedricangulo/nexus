import { FastifyReply, FastifyRequest } from "fastify";
import { createEvidence, createLinkEvidence, getEvidenceByDeliverable, deleteEvidence, restoreEvidence } from "./evidence.service.js";
import { createEvidenceSchema, createLinkEvidenceSchema, CreateLinkEvidenceInput } from "./evidence.schema.js";

// Handler for file uploads (multipart)
export async function createEvidenceHandler(request: FastifyRequest, reply: FastifyReply) {
  // Multipart handling
  const parts = request.parts();
  let fields: Record<string, any> = {};
  let fileData: { buffer: Buffer; mimetype: string; filename: string } | null = null;

  for await (const part of parts) {
    if (part.type === 'file') {
      // IMPORTANT: Consume the stream immediately to prevent timeout
      // Multipart streams must be consumed during iteration, not after
      const buffer = await part.toBuffer();
      fileData = {
        buffer,
        mimetype: part.mimetype,
        filename: part.filename,
      };
    } else {
      fields[part.fieldname] = part.value;
    }
  }

  if (!fileData) {
    return reply.status(400).send({ message: "File is required" });
  }

  // Validate fields manually since we are parsing multipart
  const result = createEvidenceSchema.safeParse(fields);
  if (!result.success) {
    return reply.status(400).send({ message: "Validation error", errors: result.error.format() });
  }

  const evidence = await createEvidence({
    deliverableId: result.data.deliverableId,
    uploaderId: request.user!.id,
    file: fileData,
  });

  return reply.code(201).send(evidence);
}

// Handler for link submissions (JSON body)
export async function createLinkEvidenceHandler(
  request: FastifyRequest<{ Body: CreateLinkEvidenceInput }>,
  reply: FastifyReply
) {
  const result = createLinkEvidenceSchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ message: "Validation error", errors: result.error.format() });
  }

  const evidence = await createLinkEvidence({
    ...result.data,
    uploaderId: request.user!.id,
  });

  return reply.code(201).send(evidence);
}

export async function getEvidenceByDeliverableHandler(request: FastifyRequest<{ Params: { deliverableId: string } }>, reply: FastifyReply) {
  const { deliverableId } = request.params;
  const evidence = await getEvidenceByDeliverable(deliverableId);
  return reply.code(200).send(evidence);
}

export async function deleteEvidenceHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = request.params;
  await deleteEvidence(id, request.user!.id);
  return reply.code(204).send();
}

export async function restoreEvidenceHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = request.params;
  const evidence = await restoreEvidence(id, request.user!.id);
  return reply.code(200).send(evidence);
}
