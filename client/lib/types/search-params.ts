import { 
  createSearchParamsCache, 
  parseAsString, 
  parseAsStringEnum 
} from "nuqs/server";
import { DeliverableStatus, PhaseType } from "@/lib/types";

export const deliverableParsers = {
  // Search query (e.g. ?query=design)
  query: parseAsString.withDefault(""),
  
  // Phase Type (e.g. ?phase=SCRUM or ?phase=ALL)
  phase: parseAsStringEnum<PhaseType | "ALL">([
    ...Object.values(PhaseType),
    "ALL"
  ]).withDefault("ALL"),

  // Status (e.g. ?status=IN_PROGRESS or ?status=ALL)
  status: parseAsStringEnum<DeliverableStatus | "ALL">([
    ...Object.values(DeliverableStatus), 
    "ALL"
  ]).withDefault("ALL"),
};

export const searchParamsCache = createSearchParamsCache(deliverableParsers);
