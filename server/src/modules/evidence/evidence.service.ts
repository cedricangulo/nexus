import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { fileService, BufferedFile } from "../../services/file.service.js";
import { createActivityLog } from "../activity-log/activity-log.service.js";
import { createNotification } from "../notification/notification.service.js";

const prisma = getPrismaClient();

interface CreateEvidenceInput {
  deliverableId: string;
  uploaderId: string;
  file: BufferedFile;
}

export async function createEvidence(input: CreateEvidenceInput) {
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

  // 3. Create Evidence record
  const evidence = await prisma.evidence.create({
    data: {
      deliverableId,
      uploaderId,
      fileUrl: uploadResult.path,
      fileName: file.filename, // Store original filename
      fileType: uploadResult.mimetype,
    },
  });

  // 4. Automatically update deliverable status to REVIEW when evidence is uploaded
  // This allows members to submit evidence without needing Team Lead permissions
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
      details: `Deliverable "${deliverable.title}" status changed to REVIEW (evidence uploaded)`,
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

  // 5. Log evidence upload
  await createActivityLog({
    userId: uploaderId,
    action: "EVIDENCE_UPLOADED",
    entityType: "Deliverable",
    entityId: deliverable.id,
    details: `Evidence "${file.filename}" uploaded for deliverable "${deliverable.title}"`,
  });

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
