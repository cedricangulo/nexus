import { z } from "zod";

/**
 * Client-side validation schema for link evidence submission
 * Only validates fields available in the dialog component
 * Server validates the complete schema including deliverableId
 */
export const linkEvidenceSchema = z.object({
  link: z.string().url(),
  fileName: z.string().optional(),
});

/**
 * Server validation schema with full validation
 */
export const linkEvidenceServerSchema = z.object({
  deliverableId: z.string(),
  link: z.string().url(),
  fileName: z.string().optional(),
});

export type LinkEvidenceServerInput = z.infer<
  typeof linkEvidenceServerSchema
>;

export type LinkEvidenceInput = z.infer<typeof linkEvidenceSchema>;
