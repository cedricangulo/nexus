import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { fileService, BufferedFile } from "../../services/file.service.js";
import { createActivityLog } from "../activity-log/activity-log.service.js";
import { createNotification } from "../notification/notification.service.js";
import { CreateLinkEvidenceInput } from "./evidence.schema.js";

const prisma = getPrismaClient();

interface CreateFileEvidenceInput {
  deliverableId: string;
  uploaderId: string;
  file: BufferedFile;
}

// Helper to update deliverable status and notify team leads
async function handleEvidenceSubmission(deliverableId: string, uploaderId: string, evidenceName: string) {
  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
  });

  if (!deliverable) return;

  // Automatically update deliverable status to REVIEW when evidence is uploaded
  if (deliverable.status !== "REVIEW" && deliverable.status !== "COMPLETED") {
    await prisma.deliverable.update({
      where: { id: deliverableId },
      data: { status: "REVIEW" },
    });

    // Log status change
    await createActivityLog({
      userId: uploaderId,
      action: "DELIVERABLE_STATUS_CHANGED",
      entityType: "Deliverable",
      entityId: deliverable.id,
      details: `Deliverable "${deliverable.title}" status changed to REVIEW (evidence submitted)`,
    });

    // Notify all team leads about new evidence submission
    const teamLeads = await prisma.user.findMany({
      where: {
        role: "TEAM_LEAD",
        deletedAt: null,
      },
      select: { id: true },
    });

    // Create notification for each team lead
    const notificationPromises = teamLeads.map((teamLead) =>
      createNotification({
        userId: teamLead.id,
        message: `New evidence submitted for "${deliverable.title}"`,
        link: `/deliverables/${deliverable.id}`,
      })
    );

    await Promise.all(notificationPromises);
  }

  // Log evidence upload/submission
  await createActivityLog({
    userId: uploaderId,
    action: "EVIDENCE_UPLOADED",
    entityType: "Deliverable",
    entityId: deliverable.id,
    details: `Evidence "${evidenceName}" submitted for deliverable "${deliverable.title}"`,
  });
}

export async function createEvidence(input: CreateFileEvidenceInput) {
  const { deliverableId, uploaderId, file } = input;

  // 1. Check if deliverable exists
  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
  });

  if (!deliverable) {
    throw new NotFoundError("Deliverable", deliverableId);
  }

  // 2. Upload file to Cloudinary
  const uploadResult = await fileService.saveFile(file);

  // 3. Create Evidence record with FILE type
  const evidence = await prisma.evidence.create({
    data: {
      deliverableId,
      uploaderId,
      type: "FILE",
      fileUrl: uploadResult.path,
      fileName: file.filename,
      fileType: uploadResult.mimetype,
    },
  });

  // 4. Handle status update and notifications
  await handleEvidenceSubmission(deliverableId, uploaderId, file.filename);

  return evidence;
}

export async function createLinkEvidence(input: CreateLinkEvidenceInput & { uploaderId: string }) {
  const { deliverableId, uploaderId, link, fileName } = input;

  // 1. Check if deliverable exists
  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
  });

  if (!deliverable) {
    throw new NotFoundError("Deliverable", deliverableId);
  }

  // 2. Create Evidence record with LINK type
  const displayName = fileName || new URL(link).hostname;
  const evidence = await prisma.evidence.create({
    data: {
      deliverableId,
      uploaderId,
      type: "LINK",
      fileUrl: link,
      fileName: displayName,
      fileType: null,
    },
  });

  // 3. Handle status update and notifications
  await handleEvidenceSubmission(deliverableId, uploaderId, displayName);

  return evidence;
}


export async function getEvidenceByDeliverable(deliverableId: string) {
  return prisma.evidence.findMany({
    where: {
      deliverableId,
      deletedAt: null
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteEvidence(id: string, userId: string) {
  const evidence = await prisma.evidence.findUnique({
    where: { id },
    include: { deliverable: true },
  });

  if (!evidence) {
    throw new NotFoundError("Evidence", id);
  }

  // Soft Delete in DB
  await prisma.evidence.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createActivityLog({
    userId,
    action: "EVIDENCE_DELETED",
    entityType: "Deliverable",
    entityId: evidence.deliverableId,
    details: `Evidence "${evidence.fileName}" deleted from deliverable "${evidence.deliverable.title}"`,
  });
}

export async function restoreEvidence(id: string, userId: string) {
  const evidence = await prisma.evidence.findUnique({
    where: { id },
    include: { deliverable: true },
  });

  if (!evidence) {
    throw new NotFoundError("Evidence", id);
  }

  if (evidence.deletedAt === null) {
    return evidence;
  }

  const restoredEvidence = await prisma.evidence.update({
    where: { id },
    data: {
      deletedAt: null,
    },
  });

  await createActivityLog({
    userId,
    action: "EVIDENCE_RESTORED",
    entityType: "Deliverable",
    entityId: evidence.deliverableId,
    details: `Evidence "${evidence.fileName}" restored to deliverable "${evidence.deliverable.title}"`,
  });

  return restoredEvidence;
}
